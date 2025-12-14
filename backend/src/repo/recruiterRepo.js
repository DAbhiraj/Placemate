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
    job_status,
    custom_questions,
    recruiter_id
  ) {
    console.log([
      job_type,
      job_status,
      custom_questions,
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
      job_status,
      recruiter_id
    ]);

    const result = await pool.query(
  `INSERT INTO jobs (
    company_name,
    custom_questions,
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
    job_status,
    recruiter_id
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
  )
  RETURNING *`,
  [
    company_name,
    custom_questions || [],
    role,
    description,
    application_deadline || null,
    online_assessment_date || null,
    interview_dates || [],
    min_cgpa,
    job_type,
    eligible_branches || [],
    salary,
    location,
    job_status || 'in initial stage',
    recruiter_id
  ]
);


    return result.rows[0];
  },

  async getAllJobs() {
    const result = await pool.query(
      `SELECT 
         j.*, 
         u.name as recruiter_name, 
         u.email as recruiter_email,
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
       GROUP BY j.job_id, u.name, u.email
       ORDER BY j.created_at DESC`,
    );
    return result.rows;
  },

  async getJobsByCompany(companyName) {
    const result = await pool.query(
      `SELECT 
         j.*, 
         u.name as recruiter_name, 
         u.email as recruiter_email,
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
       WHERE j.company_name = $1 
       GROUP BY j.job_id, u.name, u.email
       ORDER BY j.created_at DESC`,
      [companyName]
    );

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleDateString('en-IN');
    };

    return result.rows.map(job => {
      const location = Array.isArray(job.location) ? job.location : job.location ? [job.location] : [];
      const branches = Array.isArray(job.eligible_branches) ? job.eligible_branches : [];
      const interviewDates = Array.isArray(job.interview_dates) 
        ? job.interview_dates.map(formatDate) 
        : [];

      return {
        job_id: job.job_id,
        role: job.role,
        company_name: job.company_name,
        location: location,
        package: job.package,
        application_deadline: formatDate(job.application_deadline),
        online_assessment_date: formatDate(job.online_assessment_date),
        interview_dates: interviewDates,
        min_cgpa: job.min_cgpa,
        job_type: job.job_type,
        eligible_branches: branches,
        description: job.description,
        job_status: job.job_status || 'in initial stage',
        created_at: formatDate(job.created_at),
        applied_count: job.applied_count || 0,
        recruiter_id: job.recruiter_id,
        recruiter_name: job.recruiter_name,
        recruiter_email: job.recruiter_email,
        spocs: job.spocs || [],
        custom_questions: job.custom_questions || []
      };
    });
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

  if (updateData.custom_questions)
    processedData.custom_questions = toPgArray(updateData.custom_questions);

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
