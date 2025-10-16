import { pool } from "../db/db.js";

export const jobRepository = {
  async createJob(company_name, role, description, custom_questions) {
    const result = await pool.query(
      `INSERT INTO jobs (company_name, role, description, custom_questions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company_name, role, description, JSON.stringify(custom_questions)]
    );
    return result.rows[0];
  },

  async getAllJobs() {
    const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    return result.rows;
  },

  async getJobById(id) {
    const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
    return result.rows[0];
  },
};
