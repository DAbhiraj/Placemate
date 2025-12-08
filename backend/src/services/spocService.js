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
      //format dates - preserve local timezone
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        // Use local date to avoid timezone issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
        job_status: job.job_status || 'in initial stage',
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

  // Update job status (SPOC manual update)
  async updateJobStatus(spocId, jobId, newStatus) {
    return await spocRepository.updateJobStatus(spocId, jobId, newStatus);
  },

  // System auto-update job statuses based on dates
  async autoUpdateJobStatuses() {
    const jobs = await spocRepository.getJobsForAutoUpdate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const job of jobs) {
      let newStatus = null;

      // Check OT date - if passed and status is 'applications opened', change to 'ot conducted'
      if (job.job_status === 'applications opened' && job.online_assessment_date) {
        const otDate = new Date(job.online_assessment_date);
        otDate.setHours(0, 0, 0, 0);
        if (today > otDate) {
          newStatus = 'ot conducted';
        }
      }

      // Check interview dates - if any interview date passed and status is 'ot conducted', change to 'interview'
      if (job.job_status === 'ot conducted' && job.interview_dates && job.interview_dates.length > 0) {
        const interviewDates = Array.isArray(job.interview_dates) 
          ? job.interview_dates 
          : [job.interview_dates];
        
        const hasPassedInterview = interviewDates.some(dateStr => {
          const interviewDate = new Date(dateStr);
          interviewDate.setHours(0, 0, 0, 0);
          return today > interviewDate;
        });

        if (hasPassedInterview) {
          newStatus = 'interview';
        }
      }

      // Check if all interview dates have passed - change to 'completed the drive'
      if (job.job_status === 'interview' && job.interview_dates && job.interview_dates.length > 0) {
        const interviewDates = Array.isArray(job.interview_dates) 
          ? job.interview_dates 
          : [job.interview_dates];
        
        const allInterviewsPassed = interviewDates.every(dateStr => {
          const interviewDate = new Date(dateStr);
          interviewDate.setHours(0, 0, 0, 0);
          return today > interviewDate;
        });

        if (allInterviewsPassed) {
          newStatus = 'completed the drive';
        }
      }

      if (newStatus) {
        await spocRepository.autoUpdateJobStatus(job.job_id, newStatus);
      }
    }

    return { message: 'Auto-update completed', updatedJobs: jobs.length };
  }
};
