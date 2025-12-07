import { spocService } from "../services/spocService.js";

export const spocController = {
    // Get all jobs assigned to a SPOC
    async getAssignedJobs(req, res) {
        try {
            const { spocId } = req.params;
            
            if (!spocId) {
                return res.status(400).json({ message: "SPOC ID is required" });
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

    // Update assignment status
    async updateStatus(req, res) {
        try {
            const { spocId, jobId } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }

            const updated = await spocService.updateStatus(spocId, jobId, status);
            res.json(updated);
        } catch (err) {
            console.error("Error updating status:", err);
            res.status(500).json({ message: "Failed to update status" });
        }
    },

    // Update message count
    async updateMessageCount(req, res) {
        try {
            const { spocId, jobId } = req.params;
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
            const { spocId, jobId } = req.params;
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
            const { spocId, jobId } = req.params;

            await spocService.removeAssignment(spocId, jobId);
            res.json({ message: "Assignment removed successfully" });
        } catch (err) {
            console.error("Error removing assignment:", err);
            res.status(500).json({ message: "Failed to remove assignment" });
        }
    }
};
