import { pool } from "../db/db.js";

export const jobRepository = {
  async createJob(company_name, role, description, custom_questions) {
    const toPgArray = (arr) => (Array.isArray(arr) ? `{${arr.map(s => s.replace(/"/g, '\"')).join(',')}}` : null);
    const result = await pool.query(
      `INSERT INTO jobs (company_name, role, description, custom_questions)
       VALUES ($1, $2, $3, $4::text[])
       RETURNING *`,
      [company_name, role, description, toPgArray(custom_questions) || '{}']
    );
    return result.rows[0];
  },

  async getAllJobs() {
    const result = await pool.query(
      `SELECT 
         j.*, 
         u.name AS recruiter_name, 
         u.email AS recruiter_email, 
         u.phone AS recruiter_phone,
         COALESCE(
           json_agg(
             DISTINCT jsonb_build_object(
               'spoc_id', su.user_id,
               'name', su.name,
               'email', su.email,
               'roll_no', su.roll_no
             )
           ) FILTER (WHERE su.user_id IS NOT NULL), '[]'::json
         ) AS spocs
       FROM jobs j
       LEFT JOIN users u ON j.recruiter_id = u.user_id
       LEFT JOIN spoc_job_assignments sja ON sja.job_id = j.job_id
       LEFT JOIN users su ON su.user_id = sja.spoc_id
       GROUP BY j.job_id, u.name, u.email, u.phone
       ORDER BY j.created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      custom_questions: Array.isArray(row.custom_questions)
        ? row.custom_questions
        : typeof row.custom_questions === 'string' && row.custom_questions.startsWith('{')
        ? row.custom_questions.replace(/[{}]/g, '').split(',').filter(Boolean)
        : []
    }));
  },

  async getJobById(id) {
    const result = await pool.query(
      `SELECT 
         j.*, 
         u.name AS recruiter_name, 
         u.email AS recruiter_email, 
         u.phone AS recruiter_phone,
         COALESCE(
           json_agg(
             DISTINCT jsonb_build_object(
               'spoc_id', su.user_id,
               'name', su.name,
               'email', su.email,
               'roll_no', su.roll_no
             )
           ) FILTER (WHERE su.user_id IS NOT NULL), '[]'::json
         ) AS spocs
       FROM jobs j
       LEFT JOIN users u ON j.recruiter_id = u.user_id
       LEFT JOIN spoc_job_assignments sja ON sja.job_id = j.job_id
       LEFT JOIN users su ON su.user_id = sja.spoc_id
       WHERE j.job_id = $1
       GROUP BY j.job_id, u.name, u.email, u.phone`,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...row,
      custom_questions: Array.isArray(row.custom_questions)
        ? row.custom_questions
        : typeof row.custom_questions === 'string' && row.custom_questions.startsWith('{')
        ? row.custom_questions.replace(/[{}]/g, '').split(',').filter(Boolean)
        : []
    };
  }
};
