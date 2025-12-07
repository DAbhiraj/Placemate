import { pool } from "../db/db.js";

export const spocRepository = {
    // Get all jobs assigned to a specific SPOC
    async getAssignedJobsBySpocId(spocId) {
        const result = await pool.query(
            `SELECT 
                j.job_id as id,
                j.role as title,
                j.company_name as company,
                j.location,
                j.package as salary,
                j.application_deadline as deadline,
                j.online_assessment_date as ot_deadline,
                j.interview_dates as interview_deadline,
                j.min_cgpa as "cgpaRequirement",
                j.eligible_branches as branches,
                j.created_at as "postedDate",
                j.company_logo,
                sa.status,
                sa.message_count as messages,
                sa.has_changes as "hasChanges",
                sa.assigned_at
            FROM spoc_job_assignments sa
            JOIN jobs j ON sa.job_id = j.job_id
            WHERE sa.spoc_id = $1
            ORDER BY sa.assigned_at DESC`,
            [spocId]
        );
        return result.rows;
    },

    // Assign a job to a SPOC
    async assignJobToSpoc(spocId, jobId) {
        const result = await pool.query(
            `INSERT INTO spoc_job_assignments (spoc_id, job_id)
             VALUES ($1, $2)
             ON CONFLICT (spoc_id, job_id) DO NOTHING
             RETURNING *`,
            [spocId, jobId]
        );
        return result.rows[0];
    },

    // Update assignment status
    async updateAssignmentStatus(spocId, jobId, status) {
        const result = await pool.query(
            `UPDATE spoc_job_assignments 
             SET status = $3
             WHERE spoc_id = $1 AND job_id = $2
             RETURNING *`,
            [spocId, jobId, status]
        );
        return result.rows[0];
    },

    // Update message count
    async updateMessageCount(spocId, jobId, count) {
        const result = await pool.query(
            `UPDATE spoc_job_assignments 
             SET message_count = $3
             WHERE spoc_id = $1 AND job_id = $2
             RETURNING *`,
            [spocId, jobId, count]
        );
        return result.rows[0];
    },

    // Toggle has_changes flag
    async updateHasChanges(spocId, jobId, hasChanges) {
        const result = await pool.query(
            `UPDATE spoc_job_assignments 
             SET has_changes = $3
             WHERE spoc_id = $1 AND job_id = $2
             RETURNING *`,
            [spocId, jobId, hasChanges]
        );
        return result.rows[0];
    },

    // Get a specific assignment
    async getAssignment(spocId, jobId) {
        const result = await pool.query(
            `SELECT * FROM spoc_job_assignments 
             WHERE spoc_id = $1 AND job_id = $2`,
            [spocId, jobId]
        );
        return result.rows[0];
    },

    // Remove assignment
    async removeAssignment(spocId, jobId) {
        await pool.query(
            `DELETE FROM spoc_job_assignments 
             WHERE spoc_id = $1 AND job_id = $2`,
            [spocId, jobId]
        );
    }
};
