// src/repo/profileRepo.js
import { query } from "../db/db.js";

export class ProfileRepo {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    try {
      const result = await query(
        "SELECT id, name, branch, cgpa, email, role, phone, skills, resume_url, resume_filename, resume_upload_date, ats_score, ats_score_date, ats_feedback FROM users WHERE id = $1",
        [userId]
      );
      return result.rows[0];
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
      const {
        name,
        phone,
        skills,
        resume_url,
        resume_filename,
        resume_upload_date,
        ats_score,
        ats_score_date,
        ats_feedback
      } = updateData;

      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        setClause.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (phone !== undefined) {
        setClause.push(`phone = $${paramCount++}`);
        values.push(phone);
      }
      if (skills !== undefined) {
        setClause.push(`skills = $${paramCount++}`);
        values.push(skills);
      }
      if (resume_url !== undefined) {
        setClause.push(`resume_url = $${paramCount++}`);
        values.push(resume_url);
      }
      if (resume_filename !== undefined) {
        setClause.push(`resume_filename = $${paramCount++}`);
        values.push(resume_filename);
      }
      if (resume_upload_date !== undefined) {
        setClause.push(`resume_upload_date = $${paramCount++}`);
        values.push(resume_upload_date);
      }
      if (ats_score !== undefined) {
        setClause.push(`ats_score = $${paramCount++}`);
        values.push(ats_score);
      }
      if (ats_score_date !== undefined) {
        setClause.push(`ats_score_date = $${paramCount++}`);
        values.push(ats_score_date);
      }
      if (ats_feedback !== undefined) {
        setClause.push(`ats_feedback = $${paramCount++}`);
        values.push(ats_feedback);
      }

      if (setClause.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(userId);
      const queryText = `UPDATE users SET ${setClause.join(", ")} WHERE id = $${paramCount}`;
      
      const result = await query(queryText, values);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating profile:", error);
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
        "UPDATE users SET resume_url = $1, resume_filename = $2, resume_upload_date = $3 WHERE id = $4",
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
  static async updateATSScore(userId, atsData) {
    try {
      const { ats_score, ats_score_date, ats_feedback } = atsData;
      
      const result = await query(
        "UPDATE users SET ats_score = $1, ats_score_date = $2, ats_feedback = $3 WHERE id = $4",
        [ats_score, ats_score_date, ats_feedback, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating ATS score:", error);
      throw error;
    }
  }

  /**
   * Get user skills
   */
  static async getSkills(userId) {
    try {
      const result = await query(
        "SELECT skills FROM users WHERE id = $1",
        [userId]
      );
      return result.rows[0]?.skills || [];
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
      const result = await query(
        "UPDATE users SET skills = $1 WHERE id = $2",
        [skills, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating skills:", error);
      throw error;
    }
  }
}
