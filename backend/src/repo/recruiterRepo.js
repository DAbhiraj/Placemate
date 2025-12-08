import { pool } from "../db/db.js";

export const recruiterRepo = {
  // Job Management
  async createJob(
    company_name,
    role,
    description,
    application_deadline,
    online_assessment_date,
    interview_dates,
    min_cgpa,
    eligible_branches,
    salary,
    location,
    job_type,
    job_status
  ) {
    console.log([
      company_name,
      role,
      description,
      application_deadline,
      online_assessment_date,
      interview_dates,
      min_cgpa,
      eligible_branches,
      salary,
      location,
    ]);

    const result = await pool.query(
      `INSERT INTO jobs (
    company_name,
    role,
    description,
    application_deadline,
    online_assessment_date,
    interview_dates,
    min_cgpa,
    job_type,
    eligible_branches,
    package,
    location,
    job_status
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
  RETURNING *`,
      [
        company_name,
        role,
        description,
        application_deadline || null,
        online_assessment_date || null,
        interview_dates,
        min_cgpa,
        job_type,
        eligible_branches,
        salary,
        location,
        job_status || 'in initial stage'
      ]
    );

    return result.rows[0];
  },

  async getAllJobs() {
    const result = await pool.query(
      "SELECT * FROM jobs ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async getJobsByCompany(companyName) {
    const result = await pool.query(
      "SELECT * FROM jobs WHERE company_name = $1 ORDER BY created_at DESC",
      [companyName]
    );
    return result.rows;
  },

  async updateJob(jobId, updateData) {
  console.log("updated data");
  console.log(updateData);

  // Convert arrays into PostgreSQL array strings
  const toPgArray = (arr) => (Array.isArray(arr) ? `{${arr.join(",")}}` : arr);

  const processedData = { ...updateData };

  // Handle date fields - convert empty strings to NULL
  const dateFields = ['application_deadline', 'online_assessment_date'];
  dateFields.forEach(field => {
    if (field in processedData && processedData[field] === '') {
      processedData[field] = null;
    }
  });

  if (updateData.interview_dates)
    processedData.interview_dates = toPgArray(updateData.interview_dates);

  if (updateData.eligible_branches)
    processedData.eligible_branches = toPgArray(updateData.eligible_branches);

  if (updateData.location)
    processedData.location = toPgArray(updateData.location);

  const fields = Object.keys(processedData);
  const values = Object.values(processedData);

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ");

  const result = await pool.query(
    `UPDATE jobs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE job_id = $1 RETURNING *`,
    [jobId, ...values]
  );

  return result.rows[0];
},

  async deleteJob(jobId) {
    await pool.query("DELETE FROM jobs WHERE job_id = $1", [jobId]);
  },

  // Application Management
  async getApplicationsForJob(jobId) {
    const result = await pool.query(
      `SELECT a.*, u.name as student_name, u.email, u.branch, u.cgpa
       FROM applications a
       JOIN users u ON a.user_id = u.user_id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    );
    return result.rows;
  },
};
