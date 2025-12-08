import { recruiterRepo } from "../repo/recruiterRepo.js";
//import { notificationService } from "./notificationService.js";


export const recruiterService = {

    async createJob(jobData) {
            console.log(jobData);
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
                job_status
            } = jobData;
    
            return await recruiterRepo.createJob(
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
                job_status
            );
        },
    
        async getAllJobs() {
            return await recruiterRepo.getAllJobs();
        },

        async getJobsByCompany(companyName) {
            const jobs = await recruiterRepo.getJobsByCompany(companyName);
            
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
                
                // Handle interview_dates as array
                let interviewDates = job.interview_dates;
                if (Array.isArray(interviewDates)) {
                    interviewDates = interviewDates.map(d => formatDate(d));
                } else if (typeof interviewDates === "string" && interviewDates.startsWith("{")) {
                    interviewDates = interviewDates.replace(/[{}]/g, "").split(",").map(d => formatDate(d));
                } else {
                    interviewDates = [];
                }
                
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
                    applied_count: job.applied_count || 0
                };
            });
        },
    
        async updateJob(jobId, updateData) {
            return await recruiterRepo.updateJob(jobId, updateData);
        },
    
        async deleteJob(jobId) {
            return await recruiterRepo.deleteJob(jobId);
        },
    
        // Application Management
        async getApplicationsForJob(jobId) {
            return await recruiterRepo.getApplicationsForJob(jobId);
        },
}