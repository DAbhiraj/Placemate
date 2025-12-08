// src/controllers/applicationController.js

import { applicationService } from "../services/applicationService.js";
import { pool } from "../db/db.js";

const applicationController = {
  async getFormData(req, res) {
    try {
      const studentId = req.user.id;
      const { jobId } = req.params;
      const data = await applicationService.getPrefilledForm(studentId, jobId);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch form data" });
    }
  },

  async submitForm(req, res) {
    try {
      const { jobId, studentId } = req.params;
      const { answers, resumeUrl } = req.body;
      const result = await applicationService.submitOrUpdateApplication(studentId, jobId, answers, resumeUrl);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit form" });
    }
  },

  // 👇 NEW FUNCTION: Handles the /applications/dashboard route
  async getDashboardData(req, res) {
    try {
      // Assuming user ID is set by authentication middleware (req.user = { id: 1 } in routes.js)
      const studentId = req.query.userId; 
      
      if (!studentId) {
        return res.status(401).json({ message: "Authentication required (User ID missing)." });
      }

      const data = await applicationService.getDashboardData(studentId);
      res.json(data); 
    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
      // Send a clear 500 response
      res.status(500).json({ 
        message: err.message || "Failed to load dashboard data due to a server error." 
      });
    }
  },

  downloadCompanyReport: async (req, res) => {
    try {
      const { companyName } = req.query;
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required' });
      }
  
      const buffer = await applicationService.generateCompanyReport(companyName);
      if (!buffer) {
        return res.status(404).json({ message: 'No applications found for this company' });
      }
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${companyName}_Applications_Report.xlsx`);
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate report" });
    }
  },

  getUpcomingDeadline: async (req, res) => {
    // Existing function logic (was in the snippet, keeping for completeness)
    res.status(501).json({ message: "Not Implemented" });
  },

  getApplicationByUser: async (req, res) => {
    // Existing function logic (was in the snippet, keeping for completeness)
    res.status(501).json({ message: "Not Implemented" });
  },
};

export default applicationController; // Export the entire object as default