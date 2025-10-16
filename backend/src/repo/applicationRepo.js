import { pool } from "../db/db.js";

export const applicationRepository = {
  findByStudentAndJob: async (studentId, jobId) => {
    const result = await pool.query(
      "SELECT * FROM applications WHERE id = $1 AND job_id = $2",
      [studentId, jobId]
    );
    return result.rows[0];
  },

  create: async (studentId, jobId, answers, resumeUrl) => {
    const result = await pool.query(
      `INSERT INTO applications (id, job_id, answers, resume_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, jobId, answers, resumeUrl]
    );
    return result.rows[0];
  },

  update: async (applicationId, answers, resumeUrl) => {
    const result = await pool.query(
      `UPDATE applications
       SET answers = $1, resume_url = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [answers, resumeUrl, applicationId]
    );
    return result.rows[0];
  },

  getStudentProfile: async (studentId) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      studentId,
    ]);
    return result.rows[0];
  },

   getAllApplicationsForJob: async (jobId) => {
    console.log("in repo");
    const result = await pool.query(
      `SELECT s.name, s.roll_no, s.cgpa, s.branch, s.personal_email, a.answers, a.resume_url
       FROM applications a
       JOIN users s ON a.id = s.id
       WHERE a.job_id = $1`,
      [jobId]
    );
    // Only return plain rows with answers as string
    return result.rows.map(row => ({
      ...row,
      answers: JSON.stringify(row.answers)  // Excel-friendly
    }));
  },



  async findApplicationByUser(userId){
    const query = `
    SELECT 
    j.company_name,
    j.role,
    j.description
    FROM 
    applications a
    JOIN 
    jobs j ON a.job_id = j.id
    WHERE 
    a.id = $1
    ORDER BY 
    a.created_at DESC;
    
    `;
    const { rows } = await pool.query(query, [userId]);
    console.log("if rows print down");
    console.log(rows);
  return rows;
  }
};
