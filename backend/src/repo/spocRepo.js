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
                j.job_status,
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Insert assignment
            const assignmentResult = await client.query(
                `INSERT INTO spoc_job_assignments (spoc_id, job_id)
                 VALUES ($1, $2)
                 ON CONFLICT (spoc_id, job_id) DO NOTHING
                 RETURNING *`,
                [spocId, jobId]
            );
            
            // Update job status to 'in review'
            await client.query(
                `UPDATE jobs SET job_status = 'in review' WHERE job_id = $1`,
                [jobId]
            );
            
            // Get job and company details for notifications
            const jobInfo = await client.query(
                `SELECT roles, company_name FROM jobs WHERE job_id = $1`,
                [jobId]
            );
            
            // Get recruiter ID for the company
            const recruiterInfo = await client.query(
                `SELECT recruiter_id FROM recruiter_kyc WHERE company_name = $1 LIMIT 1`,
                [jobInfo.rows[0].company_name]
            );
            
            // Send notification to recruiter
            if (recruiterInfo.rows.length > 0) {
                await client.query(
                    `WITH new_notification AS (
                        INSERT INTO notifications (sender_id, title, message, type, target_role)
                        VALUES ($1, $2, $3, $4, NULL)
                        RETURNING notification_id
                    )
                    INSERT INTO user_notification_status (user_id, notification_id)
                    SELECT $5, notification_id FROM new_notification
                    ON CONFLICT (user_id, notification_id) DO NOTHING;`,
                    [
                        spocId,
                        'SPOC Assigned to Job',
                        `A SPOC has been assigned to your job posting: ${Array.isArray(jobInfo.rows[0].roles) ? jobInfo.rows[0].roles.join(', ') : jobInfo.rows[0].roles}. Status updated to 'In Review'.`,
                        'job_update',
                        recruiterInfo.rows[0].recruiter_id
                    ]
                );
            }
            
            // Send notification to SPOC
            await client.query(
                `WITH new_notification AS (
                    INSERT INTO notifications (sender_id, title, message, type, target_role)
                    VALUES ($1, $2, $3, $4, NULL)
                    RETURNING notification_id
                )
                INSERT INTO user_notification_status (user_id, notification_id)
                SELECT $5, notification_id FROM new_notification
                ON CONFLICT (user_id, notification_id) DO NOTHING;`,
                [
                    recruiterInfo.rows?.[0]?.recruiter_id || null,
                    'New Job Assignment',
                    `You have been assigned to job: ${Array.isArray(jobInfo.rows[0].roles) ? jobInfo.rows[0].roles.join(', ') : jobInfo.rows[0].roles} at ${jobInfo.rows[0].company_name}.`,
                    'job_assignment',
                    spocId
                ]
            );
            
            // Send notification to admin
            const adminResult = await client.query(
                `SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`
            );
            if (adminResult.rows.length > 0) {
                await client.query(
                    `WITH new_notification AS (
                        INSERT INTO notifications (sender_id, title, message, type, target_role)
                        VALUES ($1, $2, $3, $4, NULL)
                        RETURNING notification_id
                    )
                    INSERT INTO user_notification_status (user_id, notification_id)
                    SELECT $5, notification_id FROM new_notification
                    ON CONFLICT (user_id, notification_id) DO NOTHING;`,
                    [
                        spocId,
                        'SPOC Assigned to Job',
                        `SPOC has been assigned to job: ${Array.isArray(jobInfo.rows[0].roles) ? jobInfo.rows[0].roles.join(', ') : jobInfo.rows[0].roles} at ${jobInfo.rows[0].company_name}.`,
                        'job_assignment',
                        adminResult.rows[0].user_id
                    ]
                );
            }
            
            await client.query('COMMIT');
            console.log('DNE')
            return assignmentResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
    },

    // Update job status (SPOC can only update to 'in negotiation' or 'applications opened')
    async updateJobStatus(spocId, jobId, newStatus) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const allowedStatuses = ['in negotiation', 'applications opened'];
            if (!allowedStatuses.includes(newStatus)) {
                throw new Error('SPOC can only update status to "in negotiation" or "applications opened"');
            }
            
            const result = await client.query(
                `UPDATE jobs SET job_status = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE job_id = $2 AND EXISTS (
                     SELECT 1 FROM spoc_job_assignments 
                     WHERE spoc_id = $3 AND job_id = $2
                 )
                 RETURNING *`,
                [newStatus, jobId, spocId]
            );

            const job = result.rows[0];
            if (!job) {
                throw new Error('Job not found or SPOC not assigned');
            }

            // Send notification to recruiter
            if (job.recruiter_id) {
                await client.query(
                    `WITH new_notification AS (
                        INSERT INTO notifications (sender_id, title, message, type, target_role)
                        VALUES ($1, $2, $3, $4, NULL)
                        RETURNING notification_id
                    )
                    INSERT INTO user_notification_status (user_id, notification_id)
                    SELECT $5, notification_id FROM new_notification
                    ON CONFLICT (user_id, notification_id) DO NOTHING;`,
                    [
                        spocId,
                        'Job Status Updated by SPOC',
                        `Job status for ${Array.isArray(job.roles) ? job.roles.join(', ') : job.roles} at ${job.company_name} has been updated to "${newStatus}"`,
                        'job_status_changed',
                        job.recruiter_id
                    ]
                );
            }

            // Send notification to admin
            const adminResult = await client.query(
                `SELECT user_id FROM users WHERE roles = ARRAY['Admin'] LIMIT 1`
            );
            if (adminResult.rows.length > 0) {
                await client.query(
                    `WITH new_notification AS (
                        INSERT INTO notifications (sender_id, title, message, type, target_role)
                        VALUES ($1, $2, $3, $4, NULL)
                        RETURNING notification_id
                    )
                    INSERT INTO user_notification_status (user_id, notification_id)
                    SELECT $5, notification_id FROM new_notification
                    ON CONFLICT (user_id, notification_id) DO NOTHING;`,
                    [
                        spocId,
                        'Job Status Updated by SPOC',
                        `SPOC updated job status for ${Array.isArray(job.roles) ? job.roles.join(', ') : job.roles} at ${job.company_name} to "${newStatus}"`,
                        'job_status_changed',
                        adminResult.rows[0].user_id
                    ]
                );
            }

            await client.query('COMMIT');
            return job;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Get jobs that need automatic status updates based on dates
    async getJobsForAutoUpdate() {
        const result = await pool.query(
            `SELECT job_id, job_status, online_assessment_date, interview_dates
             FROM jobs
             WHERE job_status IN ('applications opened', 'ot conducted', 'interview')
             AND (online_assessment_date IS NOT NULL OR interview_dates IS NOT NULL)`
        );
        return result.rows;
    },

    // System auto-update job status based on dates
    async autoUpdateJobStatus(jobId, newStatus) {
        const result = await pool.query(
            `UPDATE jobs SET job_status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE job_id = $2
             RETURNING *`,
            [newStatus, jobId]
        );
        return result.rows[0];
    }
};
