import { recruiterService } from "../services/recruiterService.js";
import { pool } from "../db/db.js";

export const recruiterController = {

    // Get recruiter profile
    async getRecruiter(req, res) {
        try {
            const recruiterId = req.user.id;
            console.log("recruiter id " + recruiterId);
            const result = await pool.query(
                "SELECT  u.name, u.email, r.company_website,r.company_address,r.pan_number, r.hr_contact_number, r.years_of_experience,r.company_name,u.is_verified FROM recruiter_kyc r JOIN users u ON r.recruiter_id = u.user_id WHERE r.recruiter_id = $1 AND u.role = 'recruiter'",
                [recruiterId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Recruiter not found" });
            }
            
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch recruiter" });
        }
    },

     // Job Management
    async createJob(req, res) {
        try {
            console.log("inside controller");
            const recruiter_id = req.user.id;
            const job = await recruiterService.createJob(req.body,req.user.id);
            res.status(201).json(job);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to create job" });
        }
    },

    async getJobs(req, res) {
        try {
            const jobs = await recruiterService.getAllJobs();
            res.json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch jobs" });
        }
    },

    async getJobsByCompany(req, res) {
        try {
            const companyName = req.params.company;
            const jobs = await recruiterService.getJobsByCompany(companyName);
            res.json(jobs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch jobs by company" });
        }
    },

    async updateJob(req, res) {
        try {
            console.log(req.params.id)
            const body = req.body;
            body.package = body.package_range; // rename
            delete body.package_range;
            console.log(req.body);
            const job = await recruiterService.updateJob(req.params.id, req.body);
            res.json(job);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to update job" });
        }
    },

    async deleteJob(req, res) {
        try {
            await recruiterService.deleteJob(req.params.id);
            res.json({ message: "Job deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to delete job" });
        }
    },

    // Application Management
    async getApplicationsForJob(req, res) {
        try {
            console.log("job id is "+req.params.jobId);
            const applications = await recruiterService.getApplicationsForJob(req.params.jobId);
            res.json(applications);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch applications" });
        }
    },

}