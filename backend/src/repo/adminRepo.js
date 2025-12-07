import { pool } from "../db/db.js";

export const adminRepository = {
    // Dashboard Stats
    async getTotalStudents() {
        const result = await pool.query("SELECT COUNT(*) FROM users");
        return parseInt(result.rows[0].count);
    },

    async getTotalCompanies() {
        const result = await pool.query("SELECT COUNT(DISTINCT company_name) FROM jobs");
        return parseInt(result.rows[0].count);
    },

    async getTotalApplications() {
        const result = await pool.query("SELECT COUNT(*) FROM applications");
        return parseInt(result.rows[0].count);
    },

    async getTotalPlacements() {
        const result = await pool.query("SELECT COUNT(*) FROM applications WHERE status = 'selected'");
        return parseInt(result.rows[0].count);
    },

    async getAveragePackage() {
        const result = await pool.query(`
            SELECT AVG(CAST(REGEXP_REPLACE(package, '[^0-9.]', '', 'g') AS NUMERIC)) as avg_package 
            FROM jobs
        `);
        const avgPackage = result.rows[0].avg_package || 0;
        return `₹${(avgPackage).toFixed(1)}L`;
    },
    // Company Management
    async createCompany(name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements) {
        const result = await pool.query(
            `INSERT INTO jobs (company_name, company_logo, package, location, eligible_branches, min_cgpa, application_deadline, job_type, description, requirements, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING job_id as id, company_name as name, company_logo as logo, package, location, eligible_branches, min_cgpa, application_deadline as deadline, job_type, description, requirements`,
            [name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements, "Software Developer"]
        );
        return result.rows[0];
    },

    async getAllCompanies() {
        const result = await pool.query(`
            SELECT DISTINCT ON (j.company_name) 
              j.company_name, 
              j.company_logo, 
              j.location, 
              j.min_cgpa
            FROM jobs j
            ORDER BY j.company_name, j.created_at DESC
          `);
          
        return result.rows;
    },

    async getPlacementsByBranch() {
        const query = `
          SELECT 
              u.branch AS branch,
              COUNT(u.id) AS placed
          FROM users u
          JOIN application a ON u.id = p.id
          GROUP BY u.branch
          ORDER BY u.branch;
        `;
        const result = await pool.query(query);
        return result.rows || result[0]; // rows for pg, [0] for mysql2
      },

    async updateCompany(companyId, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await pool.query(
            `UPDATE jobs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE job_id = $1 RETURNING *`,
            [companyId, ...values]
        );
        return result.rows[0];
    },

    async deleteCompany(companyId) {
        await pool.query("DELETE FROM jobs WHERE job_id = $1", [companyId]);
    },

    

    async updateApplicationStatus(applicationId, status) {
        const result = await pool.query(
            `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE appl_id = $2 RETURNING *`,
            [status, applicationId]
        );
        return result.rows[0];
    },

    async getApplicationById(applicationId) {
        const result = await pool.query("SELECT * FROM applications WHERE appl_id = $1", [applicationId]);
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
            pool.query("SELECT COUNT(DISTINCT company_name) as total_companies FROM jobs"),
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
            "SELECT user_id as id, name,roll_no,ats_score, email, branch, cgpa, role FROM users WHERE role = 'Student' ORDER BY name"
        );
        return result.rows;
    },

    async updateStudentStatus(studentId, status) {
        // This would typically update a status field in users table
        // For now, we'll just return the student
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [studentId]);
        return result.rows[0];
    },

    // Notification Management
    async getStudentIdsByEmails(emails) {
        const placeholders = emails.map((_, index) => `$${index + 1}`).join(',');
        const result = await pool.query(
            `SELECT user_id as id FROM users WHERE email IN (${placeholders}) AND role = 'Student'`,
            emails
        );
        return result.rows.map(row => row.id);
    },

    async updateApplicationStatusesByCompany(companyName, status, studentIds) {
        // Update application statuses for students who applied to jobs from this company
        const placeholders = studentIds.map((_, index) => `$${index + 2}`).join(',');
        // studentIds is expected to be an array of user ids
        const result = await pool.query(
            `UPDATE applications 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id IN (${placeholders}) 
             AND job_id IN (
                 SELECT job_id FROM jobs WHERE company_name = $${studentIds.length + 2}
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
