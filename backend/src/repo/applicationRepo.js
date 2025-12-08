// src/repo/applicationRepo.js

import { pool } from "../db/db.js";

export const applicationRepository = {
  findByStudentAndJob: async (studentId, jobId) => {
    const result = await pool.query(
      "SELECT * FROM applications WHERE user_id = $1 AND job_id = $2",
      [studentId, jobId]
    );
    return result.rows[0];
  },

  create: async (studentId, jobId, answers, resumeUrl) => {
    const result = await pool.query(
      `INSERT INTO applications (user_id, job_id, answers, resume_url, status)
       VALUES ($1, $2, $3, $4, 'applied') RETURNING *`,
      [studentId, jobId, answers, resumeUrl]
    );
    return result.rows[0];
  },

  update: async (applicationId, answers, resumeUrl) => {
    const result = await pool.query(
      `UPDATE applications
       SET answers = $1, resume_url = $2, updated_at = NOW()
       WHERE appl_id = $3 RETURNING *`,
      [answers, resumeUrl, applicationId]
    );
    return result.rows[0];
  },

  getStudentProfile: async (studentId) => {
    // NOTE: Schema indicates 'user_id' is the primary key and the field for the ID
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      studentId,
    ]);
    return result.rows[0];
  },

  // 👇 NEW FUNCTION: Fetches all eligible and applied jobs + status
  getStudentDashboardData: async (studentId, branch, cgpa) => {
    const query = `
      SELECT
        j.job_id,
        j.company_name,
        j.role,
        j.location,
        j.package,
        j.application_deadline,
        j.online_assessment_date,
        j.interview_dates,
        j.description,
        j.min_cgpa,
        j.eligible_branches,
        a.status
      FROM jobs j
      -- LEFT JOIN to include jobs without an entry in the 'applications' table
      LEFT JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
      WHERE
        -- CONDITION 1: Job meets eligibility criteria
        (
          ($2 = ANY(j.eligible_branches))
          AND (j.min_cgpa <= $3)
        )
        -- OR CONDITION 2: Student has already applied (status is NOT NULL)
        OR a.user_id IS NOT NULL 
      ORDER BY j.application_deadline DESC, j.created_at DESC;
    `;
    const { rows } = await pool.query(query, [studentId, branch, cgpa]);
    
    // Process results to set the default status for non-applied, eligible jobs
    return rows.map(row => {
      const today = new Date();
      const deadline = row.application_deadline ? new Date(row.application_deadline) : null;

      let status = row.status || 'not applied';

      // If job is not applied and deadline has passed, mark as missed
      if (!row.status && deadline && today > deadline) {
        status = 'deadline missed';
      }

      return {
        ...row,
        status
      };
    });
  },
  
  // ... (rest of applicationRepository)

  getApplicationsByCompany: async (companyName) => {
    const query = `
      SELECT 
        a.appl_id,
        u.name AS applicant_name,
        u.email AS applicant_email,
        j.company_name,
        j.role,
        j.location,
        j.package AS package,
        a.status AS application_status,
        a.resume_url,
        a.created_at
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      JOIN jobs j ON a.job_id = j.job_id
      WHERE LOWER(j.company_name) = LOWER($1)
      ORDER BY a.created_at DESC;
    `;
    const { rows } = await pool.query(query, [companyName]);
    return rows;
  },
  
  async findApplicationByUser(userId){
    const query = `
    SELECT 
    j.company_name,
    j.role,
    j.description,
    a.updated_at,
    a.status
    FROM applications a 
    JOIN jobs j ON a.job_id = j.job_id 
    WHERE a.user_id = $1
    ORDER BY a.updated_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },
};