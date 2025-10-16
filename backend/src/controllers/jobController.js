import { jobService } from "../services/jobService.js";

export const jobController = {
  async createJob(req, res) {
    try {
        console.log('inside controller');
      const job = await jobService.addJob(req.body);
      res.status(201).json(job);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create job" });
    }
  },

  async getJobs(req, res) {
    try {
      const jobs = await jobService.fetchAllJobs();
      res.json(jobs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  },

  async getJob(req, res) {
    try {
      const job = await jobService.fetchJobById(req.params.id);
      res.json(job);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  },
};
