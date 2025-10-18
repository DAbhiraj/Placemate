import { applicationService } from "../services/applicationService.js";


const applicationController = {
   async getFormData (req, res) {
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

   async submitForm (req, res) {
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

   exportExcel: async (req, res) => {
    try {
      console.log("int controller");
      const { jobId } = req.params;
      const buffer = await applicationService.exportToExcel(jobId);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=job_${jobId}_applications.xlsx`
      );

      res.send(buffer);  // Send Excel file
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to export Excel" });
    }
  },

  getApplicationByUser: async(req,res) =>{
    try{
     const {userId} = req.params;
     console.log("user id is "+userId);
     const applications = await applicationService.getApplicationByUser(userId);
     console.log("applications in controller");
     //console.log(applications);
     res.status(200).json(applications);
    }catch(err){
      console.error(err);
      res.status(500).json({ message: "Failed to fetch applications by user" });
    }

  }
};

export default applicationController;
