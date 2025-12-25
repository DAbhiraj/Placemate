import { recruiterRepo } from "../repo/recruiterRepo.js";
import { notificationService } from "./notificationService.js";
import { pool } from "../db/db.js";


export const recruiterService = {

    async createJob(jobData,recruiter_id) {
            //console.log(jobData);
            const {
                company_name,
                role,
                description,
                application_deadline,
                online_assessment_date,
                interview_dates,
                min_cgpa,
                job_type,
                eligible_branches,
                package_range,
                location,
                job_status,
                custom_questions,
                job_description_url,
                job_description_public_id,
                job_description_filename
            } = jobData;
    
            const job = await recruiterRepo.createJob(
                company_name,
                role,
                description,
                application_deadline,
                online_assessment_date,
                interview_dates,
                min_cgpa,
                eligible_branches,
                package_range,
                location,
                job_type,
                job_status,
                custom_questions,
                recruiter_id,
                job_description_url,
                job_description_public_id,
                job_description_filename
            );

            // Send notification to admin
            try {
                const adminResult = await pool.query(
                    `SELECT user_id FROM users WHERE roles = ARRAY['Admin'] LIMIT 1`
                );
                if (adminResult.rows.length > 0) {
                    await notificationService.notifyUser(
                        adminResult.rows[0].user_id,
                        `New job posted: ${role} at ${company_name}`,
                        'job_created',
                        'New Job Posted',
                        recruiter_id
                    );
                }

                // Send notification to assigned SPOCs if any
                const spocResult = await pool.query(
                    `SELECT spoc_id FROM spoc_job_assignments WHERE job_id = $1`,
                    [job.job_id]
                );
                for (const row of spocResult.rows) {
                    await notificationService.notifyUser(
                        row.spoc_id,
                        `New job posted: ${role} at ${company_name}`,
                        'job_created',
                        'New Job Posted',
                        recruiter_id
                    );
                }
            } catch (notifErr) {
                console.error('Error sending job creation notifications:', notifErr);
            }

            return job;
        },
    
        async getAllJobs() {
            return await recruiterRepo.getAllJobs();
        },

        async getJobsByCompany(companyName) {
            const jobs = await recruiterRepo.getJobsByCompany(companyName);
            console.log('in controller')
            console.log(jobs)
            // Format dates - preserve local timezone
            const formatDate = (date) => {
                if (!date) return null;
                const d = new Date(date);
                if (isNaN(d.getTime())) return null;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // Format the jobs data
            return jobs.map(job => {
                // Handle location array
                let location = job.location;
                if (Array.isArray(location)) {
                    location = location.join(", ");
                } else if (typeof location === "string" && location.startsWith("{")) {
                    location = location.replace(/[{}]/g, "").split(",").join(", ");
                }
                
                // Handle branches array
                let branches = job.eligible_branches;
                if (Array.isArray(branches)) {
                    branches = branches.join(", ");
                } else if (typeof branches === "string" && branches.startsWith("{")) {
                    branches = branches.replace(/[{}]/g, "").split(",").join(", ");
                }
                
                // Preserve interview_dates as received (avoid over-formatting that was dropping values)
                let interviewDates = job.interview_dates;
                if (typeof interviewDates === "string" && interviewDates.startsWith("{")) {
                    interviewDates = interviewDates.replace(/[{}]/g, "").split(",");
                } else if (!Array.isArray(interviewDates)) {
                    interviewDates = interviewDates ? [interviewDates] : [];
                }
                
                return {
        job_id: job.job_id,
        role: job.role,
        company_name: job.company_name,
        location: location,
        package: job.package,
        application_deadline: job.application_deadline,
        online_assessment_date: job.online_assessment_date,
        interview_dates: interviewDates,
        min_cgpa: job.min_cgpa,
        job_type: job.job_type,
        eligible_branches: branches,
        description: job.description,
        job_description_url: job.job_description_url,
        job_description_public_id: job.job_description_public_id,
        job_description_filename: job.job_description_filename,
        job_status: job.job_status || 'in initial stage',
        created_at: formatDate(job.created_at),
        applied_count: job.applied_count || 0,
        recruiter_id: job.recruiter_id,
        recruiter_name: job.recruiter_name,
        recruiter_email: job.recruiter_email
      };
            });
        },
    
        async updateJob(jobId, updateData) {
        const job = await recruiterRepo.updateJob(jobId, updateData);

        // Send notification to admin
        try {
            const adminResult = await pool.query(
                `SELECT user_id FROM users WHERE roles = ARRAY['Admin'] LIMIT 1`
            );
            if (adminResult.rows.length > 0) {
                await notificationService.notifyUser(
                    adminResult.rows[0].user_id,
                    `Job updated: ${job.role} at ${job.company_name}`,
                    'job_updated',
                    'Job Updated',
                    job.recruiter_id
                );
            }

            // Send notification to assigned SPOCs
            const spocResult = await pool.query(
                `SELECT spoc_id FROM spoc_job_assignments WHERE job_id = $1`,
                [jobId]
            );
            for (const row of spocResult.rows) {
                await notificationService.notifyUser(
                    row.spoc_id,
                    `Job updated: ${job.role} at ${job.company_name}`,
                    'job_updated',
                    'Job Updated',
                    job.recruiter_id
                );
            }
        } catch (notifErr) {
            console.error('Error sending job update notifications:', notifErr);
        }

        return job;
    },
    
        async deleteJob(jobId) {
            return await recruiterRepo.deleteJob(jobId);
        },
    
        // Application Management
        async getApplicationsForJob(jobId) {
            return await recruiterRepo.getApplicationsForJob(jobId);
        },
}