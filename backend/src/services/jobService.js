import { jobRepository } from "../repo/jobRepo.js";

export const jobService = {
  async addJob(jobData) {
    const { company_name, role, description, custom_questions } = jobData;
    return await jobRepository.createJob(company_name, role, description, custom_questions);
  },

  async fetchAllJobs() {
    return await jobRepository.getAllJobs();
  },

  async fetchJobById(id) {
    return await jobRepository.getJobById(id);
  },
};
