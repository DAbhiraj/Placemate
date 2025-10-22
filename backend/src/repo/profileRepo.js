// src/repo/profileRepo.js
import { query } from "../db/db.js";

export class ProfileRepo {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    try {
      const result = await query(
        "SELECT id, name, branch, cgpa, email, role, skills, resume_url, resume_filename, resume_upload_date, ats_score, ats_score_date, ats_feedback FROM users WHERE id = $1",
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
      const { branch, cgpa } = updateData;
  
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
  
      if (setClause.length === 0) {
        console.log("No fields to update");
        return false;
      }
  
      // Add userId for WHERE clause
      values.push(userId);
  
      const queryText = `
        UPDATE users 
        SET ${setClause.join(", ")} 
        WHERE id = $${values.length}
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
