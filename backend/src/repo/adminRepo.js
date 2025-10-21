import { pool } from "../db/db.js";

export const adminRepository = {
    // Company Management
    async createCompany(name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements) {
        const result = await pool.query(
            `INSERT INTO companies (id, name, logo, package, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [generateId(), name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements]
        );
        return result.rows[0];
    },

    async getAllCompanies() {
        const result = await pool.query("SELECT * FROM companies ORDER BY created_at DESC");
        return result.rows;
    },

    async updateCompany(companyId, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await pool.query(
            `UPDATE companies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [companyId, ...values]
        );
        return result.rows[0];
    },

    async deleteCompany(companyId) {
        await pool.query("DELETE FROM companies WHERE id = $1", [companyId]);
    },

    // Job Management
    async createJob(company_name, role, description, custom_questions, application_deadline, online_assessment_date, interview_dates, min_cgpa, eligible_branches, package_range, location) {
        const result = await pool.query(
            `INSERT INTO jobs (company_name, role, description, custom_questions, application_deadline, online_assessment_date, interview_dates, min_cgpa, eligible_branches, package_range, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [company_name, role, description, JSON.stringify(custom_questions), application_deadline, online_assessment_date, interview_dates, min_cgpa, eligible_branches, package_range, location]
        );
        return result.rows[0];
    },

    async getAllJobs() {
        const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
        return result.rows;
    },

    async updateJob(jobId, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await pool.query(
            `UPDATE jobs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [jobId, ...values]
        );
        return result.rows[0];
    },

    async deleteJob(jobId) {
        await pool.query("DELETE FROM jobs WHERE id = $1", [jobId]);
    },

    // Application Management
    async getApplicationsForJob(jobId) {
        const result = await pool.query(
            `SELECT a.*, u.name as student_name, u.email, u.branch, u.cgpa
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
            [jobId]
        );
        return result.rows;
    },

    async updateApplicationStatus(applicationId, status) {
        const result = await pool.query(
            `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, applicationId]
        );
        return result.rows[0];
    },

    async getApplicationById(applicationId) {
        const result = await pool.query("SELECT * FROM applications WHERE id = $1", [applicationId]);
        return result.rows[0];
    },

    async getApplicationByStudentAndJob(studentId, jobId) {
        const result = await pool.query(
            "SELECT * FROM applications WHERE user_id = $1 AND job_id = $2",
            [studentId, jobId]
        );
        return result.rows[0];
    },

    // Dashboard Stats
    async getDashboardStats() {
        const [studentsResult, companiesResult, applicationsResult, placementsResult] = await Promise.all([
            pool.query("SELECT COUNT(*) as total_students FROM users WHERE role = 'Student'"),
            pool.query("SELECT COUNT(*) as total_companies FROM companies"),
            pool.query("SELECT COUNT(*) as total_applications FROM applications"),
            pool.query("SELECT COUNT(*) as total_placements FROM applications WHERE status = 'selected'")
        ]);

        return {
            totalStudents: parseInt(studentsResult.rows[0].total_students),
            totalCompanies: parseInt(companiesResult.rows[0].total_companies),
            totalApplications: parseInt(applicationsResult.rows[0].total_applications),
            totalPlacements: parseInt(placementsResult.rows[0].total_placements)
        };
    },

    // Student Management
    async getAllStudents() {
        const result = await pool.query(
            "SELECT id, name, email, branch, cgpa, role FROM users WHERE role = 'Student' ORDER BY name"
        );
        return result.rows;
    },

    async updateStudentStatus(studentId, status) {
        // This would typically update a status field in users table
        // For now, we'll just return the student
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [studentId]);
        return result.rows[0];
    },

    // Notification Management
    async getStudentIdsByEmails(emails) {
        const placeholders = emails.map((_, index) => `$${index + 1}`).join(',');
        const result = await pool.query(
            `SELECT id FROM users WHERE email IN (${placeholders}) AND role = 'Student'`,
            emails
        );
        return result.rows.map(row => row.id);
    },

    async updateApplicationStatusesByCompany(companyName, status, studentIds) {
        // Update application statuses for students who applied to jobs from this company
        const placeholders = studentIds.map((_, index) => `$${index + 2}`).join(',');
        const result = await pool.query(
            `UPDATE applications 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id IN (${placeholders}) 
             AND job_id IN (
                 SELECT id FROM jobs WHERE company_name = $${studentIds.length + 2}
             )
             RETURNING *`,
            [status, ...studentIds, companyName]
        );
        return result.rows;
    }
};

// Helper function to generate unique IDs
function generateId() {
    return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
