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
  
      const buffer = await generateCompanyReport(companyName);
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

  // GET /api/upcoming-deadlines/:userId
  getUpcomingDeadline: async (req, res) => {
    const { userId } = req.params;
    let { branch, cgpa } = req.query;
    if (cgpa === undefined && req.query["amp;cgpa"]) {
      cgpa = req.query["amp;cgpa"];
    }

    console.log("in upcoming controller");
    console.log("Full req.query:", req.query);
    console.log(userId);
    console.log(branch);
    console.log(cgpa);
    try {
      const result = await pool.query(
        `SELECT 
    j.id               AS job_id,
    j.company_name,
    j.role,
    j.application_deadline,
    j.online_assessment_date,
    j.interview_dates,
    COALESCE(a.status, 'applied') AS application_status
FROM jobs j
LEFT JOIN applications a
    ON j.id = a.job_id
    AND a.id = $1           -- $1 = logged-in user id
WHERE
    -- user must be eligible for the job
    ($2 = ANY(j.eligible_branches))   -- $2 = user branch
    AND (j.min_cgpa <= $3)            -- $3 = user cgpa
    AND (
        -- CASE 1: No application record for this user -> show job deadline if still upcoming
        (a.appl_id IS NULL AND j.application_deadline >= CURRENT_DATE)

        OR  

        -- CASE 2: Application exists (status NULL treated as 'applied') -> show online assessment if upcoming
        ((a.status IS NULL OR a.status = 'applied') AND j.online_assessment_date >= NOW())

        OR

        -- CASE 3: Application exists and user is shortlisted -> show first interview date if upcoming
        (a.status = 'shortlisted' AND (j.interview_dates IS NOT NULL AND j.interview_dates[1] >= NOW()))
    )
ORDER BY
    -- pick the earliest relevant date for ordering (deadline/test/interview)
    COALESCE(j.application_deadline, j.online_assessment_date, j.interview_dates[1]) ASC;
`,
        [userId, branch, cgpa]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }

};

export default applicationController;
