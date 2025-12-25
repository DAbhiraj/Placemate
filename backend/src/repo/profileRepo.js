// src/repo/profileRepo.js
import { query } from "../db/db.js";

function cleanSkillEntry(val) {
  if (typeof val !== 'string') return val;
  // Replace escaped quotes and newlines, then strip surrounding quotes/backslashes
  let v = String(val);
  // Replace common escaped sequences
  v = v.replace(/\\r|\\n/g, ' ');
  v = v.replace(/\\"/g, '"');
  v = v.replace(/\"/g, '"');
  // Remove any remaining backslashes
  v = v.replace(/\\+/g, '');
  // Trim surrounding quotes or braces leftover
  v = v.replace(/^[\[\]{\}"]+|[\[\]{\}"]+$/g, '');
  return v.trim();
}

export class ProfileRepo {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    try {
      const result = await query(
        "SELECT user_id as id, name, branch, cgpa, email,phone,roll_no, roles, skills, resume_url, resume_filename, resume_upload_date, application_type FROM users WHERE user_id = $1",
        [userId]
      );
      const row = result.rows[0];
      if (row) {
        // Normalize skills to an array when returning
        const raw = row.skills;
        try {
          if (Array.isArray(raw)) {
            row.skills = raw.map(cleanSkillEntry).filter(Boolean);
          } else if (typeof raw === 'string' && raw.trim()) {
            // Try JSON parse first
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                row.skills = parsed.map(cleanSkillEntry).filter(Boolean);
              } else if (typeof parsed === 'string') {
                row.skills = String(parsed).split(/,|\\n/).map(s => cleanSkillEntry(s)).filter(Boolean);
              } else {
                row.skills = [];
              }
            } catch (e) {
              // Fallback to splitting by comma/newline and cleaning
              row.skills = String(raw).replace(/(^[\[{]+|[\]}]+$)/g, '').split(/,|\\n/).map(s => cleanSkillEntry(s)).filter(Boolean);
            }
          } else {
            row.skills = [];
          }
        } catch (err) {
          row.skills = [];
        }
      }
      return row;
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    try {
      const { branch, cgpa, email, name, application_type } = updateData;
      
  
      // Build dynamic SQL for only the provided fields
      const setClause = [];
      const values = [];
  
      if (branch !== undefined && branch !== '') {
        setClause.push(`branch = $${values.length + 1}`);
        values.push(branch);
      }
  
      if (cgpa !== undefined && cgpa !== '') {
        setClause.push(`cgpa = $${values.length + 1}`);
        values.push(cgpa);
      }

      if (email !== undefined && email !== '') {
        setClause.push(`email = $${values.length + 1}`);
        values.push(email);
      }

      if (name !== undefined && name !== '') {
        setClause.push(`name = $${values.length + 1}`);
        values.push(name);
      }
  
      if (application_type !== undefined && application_type !== '') {
        setClause.push(`application_type = $${values.length + 1}`);
        values.push(application_type);
      }
      if (setClause.length === 0) {
        console.log("No fields to update");
        return false;
      }
  
      // Add userId for WHERE clause
      values.push(userId);
  
      const queryText = `
        UPDATE users 
        SET ${setClause.join(", ")} 
        WHERE user_id = $${values.length}
      `;
  
      const result = await query(queryText, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating branch and cgpa:", error);
      throw error;
    }
  }
  

  /**
   * Update resume information
   */
  static async updateResume(userId, resumeData) {
    try {
      const { resume_url, resume_filename, resume_upload_date } = resumeData;
      
      const result = await query(
        "UPDATE users SET resume_url = $1, resume_filename = $2, resume_upload_date = $3 WHERE user_id = $4",
        [resume_url, resume_filename, resume_upload_date, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating resume:", error);
      throw error;
    }
  }

  /**
   * Update ATS score
   */
  // static async updateATSScore(userId, atsData) {
  //   try {
  //     const { ats_score, ats_score_date, ats_feedback } = atsData;
      
  //     const result = await query(
  //       "UPDATE users SET ats_score = $1, ats_score_date = $2, ats_feedback = $3 WHERE user_id = $4",
  //       [ats_score, ats_score_date, ats_feedback, userId]
  //     );
      
  //     return result.rowCount > 0;
  //   } catch (error) {
  //     console.error("Error updating ATS score:", error);
  //     throw error;
  //   }
  // }

  /**
   * Get user skills
   */
  static async getSkills(userId) {
    try {
      const result = await query(
        "SELECT skills FROM users WHERE user_id = $1",
        [userId]
      );
      const raw = result.rows[0]?.skills;
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map(cleanSkillEntry).filter(Boolean);
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed.map(cleanSkillEntry).filter(Boolean) : String(parsed).split(/,|\\n/).map(s => cleanSkillEntry(s)).filter(Boolean);
        } catch (e) {
          return String(raw).replace(/(^[\[{]+|[\]}]+$)/g, '').split(/,|\\n/).map(s => cleanSkillEntry(s)).filter(Boolean);
        }
      }
      return [];
    } catch (error) {
      console.error("Error getting skills:", error);
      throw error;
    }
  }

  /**
   * Update user skills
   */
  static async updateSkills(userId, skills) {
    try {
      // Store skills as JSON string when provided as array, otherwise store as-is
      const toStore = Array.isArray(skills) ? JSON.stringify(skills) : skills;
      const result = await query(
        "UPDATE users SET skills = $1 WHERE user_id = $2",
        [toStore, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating skills:", error);
      throw error;
    }
  }
}
