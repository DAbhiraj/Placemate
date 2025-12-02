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
      `INSERT INTO applications (user_id, job_id, answers, resume_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
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
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      studentId,
    ]);
    return result.rows[0];
  },

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
    FROM 
    applications a
    JOIN 
    jobs j ON a.job_id = j.job_id
    WHERE 
    a.user_id = $1
    ORDER BY 
    a.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    console.log("if rows print down");
    console.log(rows);
    return rows;
  }
};
