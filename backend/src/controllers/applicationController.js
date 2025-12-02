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
  
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${companyName}_applications.xlsx`
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
  
      res.send(buffer);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getApplicationByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("user id is " + userId);
      const applications = await applicationService.getApplicationByUser(userId);
      console.log("applications in controller");
      //console.log(applications);
      res.status(200).json(applications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch applications by user" });
    }

  },

  // GET /api/upcoming-deadlines/:userId?type=application|assessment|interview
  getUpcomingDeadline: async (req, res) => {
    const { userId } = req.params;
    let { branch, cgpa, type } = req.query;
    if (cgpa === undefined && req.query["amp;cgpa"]) {
      cgpa = req.query["amp;cgpa"];
    }

    console.log("in upcoming controller");
    console.log("Full req.query:", req.query);
    console.log("userId:", userId);
    console.log("branch:", branch);
    console.log("cgpa:", cgpa);
    console.log("type:", type);

    try {
      let query;
      let params = [userId, branch, cgpa];

      if (type === "application") {
        // CASE 1: User hasn't applied yet -> show application deadline if upcoming
        query = `SELECT 
      j.job_id               AS job_id,
    j.company_name,
    j.role,
    j.application_deadline,
    j.online_assessment_date,
    j.interview_dates,
    NULL AS application_status
FROM jobs j
LEFT JOIN applications a
      ON j.job_id = a.job_id
    WHERE
    a.user_id = $1 is NULL
    AND ($2 = ANY(j.eligible_branches))
    AND (j.min_cgpa <= $3)
    AND j.application_deadline >= CURRENT_TIMESTAMP
ORDER BY j.application_deadline ASC;`;
      } else if (type === "assessment") {
        // CASE 2: User applied -> show online assessment if upcoming
        query = `SELECT 
      j.job_id               AS job_id,
    j.company_name,
    j.role,
    j.application_deadline,
    j.online_assessment_date,
    j.interview_dates,
    a.status AS application_status
FROM jobs j
INNER JOIN applications a
      ON j.job_id = a.job_id
    AND a.user_id = $1
WHERE
    ($2 = ANY(j.eligible_branches))
    AND (j.min_cgpa <= $3)
    AND a.status is NULL
    AND j.online_assessment_date >= CURRENT_TIMESTAMP
ORDER BY j.online_assessment_date ASC;`;
      } else if (type === "interview") {
        // CASE 3 & 4: User shortlisted or selected -> show interview dates if upcoming
        query = `SELECT 
      j.job_id               AS job_id,
    j.company_name,
    j.role,
    j.application_deadline,
    j.online_assessment_date,
    j.interview_dates,
    a.status AS application_status
FROM jobs j
INNER JOIN applications a
      ON j.job_id = a.job_id
    AND a.user_id = $1
WHERE
    ($2 = ANY(j.eligible_branches))
    AND (j.min_cgpa <= $3)
    AND (a.status = 'interview_shortlist' OR a.status = 'selected')
    AND j.interview_dates IS NOT NULL
    AND j.interview_dates[1] >= CURRENT_TIMESTAMP
ORDER BY j.interview_dates[1] ASC;`
      } else {
        // If no type or invalid type, return empty array
        return res.json([]);
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }

};

export default applicationController;
