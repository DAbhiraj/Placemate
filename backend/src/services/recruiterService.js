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
                location
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
                job_type
            );
        },
    
        async getAllJobs() {
            return await recruiterRepo.getAllJobs();
        },

        async getJobsByCompany(companyName) {
            return await recruiterRepo.getJobsByCompany(companyName);
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