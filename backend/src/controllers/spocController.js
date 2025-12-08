import { spocService } from "../services/spocService.js";

export const spocController = {
    // Get all jobs assigned to a SPOC
    async getAssignedJobs(req, res) {
        try {
            const spocId = req.user.id; // Get spocId from authenticated user (cookies)
            
            if (!spocId) {
                return res.status(401).json({ message: "SPOC ID not found in authentication" });
            }

            const jobs = await spocService.getAssignedJobs(spocId);
            res.json(jobs);
        } catch (err) {
            console.error("Error fetching assigned jobs:", err);
            res.status(500).json({ message: "Failed to fetch assigned jobs" });
        }
    },

    // Assign a job to a SPOC (Admin functionality)
    async assignJob(req, res) {
        try {
            const { spocId, jobId } = req.body;

            if (!spocId || !jobId) {
                return res.status(400).json({ message: "SPOC ID and Job ID are required" });
            }

            const assignment = await spocService.assignJob(spocId, jobId);
            res.status(201).json(assignment);
        } catch (err) {
            console.error("Error assigning job:", err);
            res.status(500).json({ message: "Failed to assign job" });
        }
    },

    // Update message count
    async updateMessageCount(req, res) {
        try {
            const spocId = req.user.id; // Get spocId from authenticated user (cookies)
            const { jobId } = req.params;
            const { count } = req.body;

            if (count === undefined) {
                return res.status(400).json({ message: "Message count is required" });
            }

            const updated = await spocService.updateMessageCount(spocId, jobId, count);
            res.json(updated);
        } catch (err) {
            console.error("Error updating message count:", err);
            res.status(500).json({ message: "Failed to update message count" });
        }
    },

    // Update has_changes flag
    async updateHasChanges(req, res) {
        try {
            const spocId = req.user.id; // Get spocId from authenticated user (cookies)
            const { jobId } = req.params;
            const { hasChanges } = req.body;

            if (hasChanges === undefined) {
                return res.status(400).json({ message: "hasChanges flag is required" });
            }

            const updated = await spocService.updateHasChanges(spocId, jobId, hasChanges);
            res.json(updated);
        } catch (err) {
            console.error("Error updating hasChanges:", err);
            res.status(500).json({ message: "Failed to update hasChanges flag" });
        }
    },

    // Remove assignment
    async removeAssignment(req, res) {
        try {
            const spocId = req.user.id; // Get spocId from authenticated user (cookies)
            const { jobId } = req.params;

            await spocService.removeAssignment(spocId, jobId);
            res.json({ message: "Assignment removed successfully" });
        } catch (err) {
            console.error("Error removing assignment:", err);
            res.status(500).json({ message: "Failed to remove assignment" });
        }
    },

    // Update job status (SPOC manual update)
    async updateJobStatus(req, res) {
        try {
            const spocId = req.user.id; // Get spocId from authenticated user (cookies)
            const { jobId } = req.params;
            const { job_status } = req.body;

            if (!job_status) {
                return res.status(400).json({ message: "Job status is required" });
            }

            const updated = await spocService.updateJobStatus(spocId, jobId, job_status);
            res.json(updated);
        } catch (err) {
            console.error("Error updating job status:", err);
            res.status(500).json({ message: err.message || "Failed to update job status" });
        }
    },

    // System auto-update job statuses (called by cron or manually)
    async autoUpdateJobStatuses(req, res) {
        try {
            const result = await spocService.autoUpdateJobStatuses();
            res.json(result);
        } catch (err) {
            console.error("Error auto-updating job statuses:", err);
            res.status(500).json({ message: "Failed to auto-update job statuses" });
        }
    }
};
