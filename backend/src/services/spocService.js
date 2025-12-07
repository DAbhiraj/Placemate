import { spocRepository } from "../repo/spocRepo.js";

export const spocService = {
  // Get all jobs assigned to a SPOC
  async getAssignedJobs(spocId) {
    const jobs = await spocRepository.getAssignedJobsBySpocId(spocId);

    //console.log(jobs);

    // Format the data for frontend
    return jobs.map((job) => {
      // Handle location array
      let location = job.location;
      if (Array.isArray(location)) {
        location = location.join(", ");
      } else if (typeof location === "string" && location.startsWith("{")) {
        // PostgreSQL array string format
        location = location.replace(/[{}]/g, "").split(",").join(", ");
      }

      // Handle branches array
      let branches = job.branches;
      if (Array.isArray(branches)) {
        branches = branches.join(", ");
      } else if (typeof branches === "string" && branches.startsWith("{")) {
        branches = branches.replace(/[{}]/g, "").split(",").join(", ");
      }
      //format dates
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      };
      // Handle interview_deadline as array of dates
      let interviewDeadlines = job.interview_deadline;

      if (Array.isArray(interviewDeadlines)) {
        interviewDeadlines = interviewDeadlines.map((d) => formatDate(d));
      } else if (
        typeof interviewDeadlines === "string" &&
        interviewDeadlines.startsWith("{")
      ) {
        interviewDeadlines = interviewDeadlines
          .replace(/[{}]/g, "")
          .split(",")
          .map((d) => formatDate(d));
      } else {
        interviewDeadlines = [];
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: location,
        salary: job.salary,
        openings: job.openings || 0,
        deadline: formatDate(job.deadline),
        ot_deadline: formatDate(job.ot_deadline),
        interview_deadline: interviewDeadlines,
        status: job.status,
        cgpaRequirement: job.cgpaRequirement
          ? `${job.cgpaRequirement}+`
          : "N/A",
        branches: branches,
        postedDate: formatDate(job.postedDate),
        messages: job.messages || 0,
        hasChanges: job.hasChanges || false,
        company_logo: job.company_logo,
      };
    });
  },

  // Assign a job to a SPOC
  async assignJob(spocId, jobId) {
    return await spocRepository.assignJobToSpoc(spocId, jobId);
  },

  // Update assignment status (In Discussion, Awaiting Review, Finalized)
  async updateStatus(spocId, jobId, status) {
    return await spocRepository.updateAssignmentStatus(spocId, jobId, status);
  },

  // Update message count
  async updateMessageCount(spocId, jobId, count) {
    return await spocRepository.updateMessageCount(spocId, jobId, count);
  },

  // Update has_changes flag
  async updateHasChanges(spocId, jobId, hasChanges) {
    return await spocRepository.updateHasChanges(spocId, jobId, hasChanges);
  },

  // Remove assignment
  async removeAssignment(spocId, jobId) {
    return await spocRepository.removeAssignment(spocId, jobId);
  },
};
