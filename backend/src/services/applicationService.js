import { applicationRepository } from "../repo/applicationRepo.js";
import { notificationService } from "./notificationService.js";
import ExcelJS from "exceljs";

export const applicationService = {
  getPrefilledForm: async (studentId, jobId) => {
    const profile = await applicationRepository.getStudentProfile(studentId);
    const existingApp = await applicationRepository.findByStudentAndJob(studentId, jobId);
    return { profile, existingApp };
  },

  submitOrUpdateApplication: async (studentId, jobId, answers, resumeUrl) => {
    const existing = await applicationRepository.findByStudentAndJob(studentId, jobId);
    let application;

    if (existing) {
      application = await applicationRepository.update(existing.id, answers, resumeUrl);
      // Asynchronous notification
      setImmediate(() => {
        notificationService.notifyStudent(
          studentId,
          "Your job application was updated successfully!",
          "APPLICATION_UPDATED"
        );
      });
    } else {
      application = await applicationRepository.create(studentId, jobId, answers, resumeUrl);
      setImmediate(() => {
        notificationService.notifyStudent(
          studentId,
          "Your job application was submitted successfully!",
          "APPLICATION_SUBMITTED"
        );
      });
    }

    return application;
  },

  exportToExcel: async (jobId) => {
    console.log("in services");
    const data = await applicationRepository.getAllApplicationsForJob(jobId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Applications");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Roll No", key: "roll_no", width: 15 },
      { header: "CGPA", key: "cgpa", width: 10 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Email", key: "personal_email", width: 25 },
      { header: "Answers", key: "answers", width: 50 },
      { header: "Resume URL", key: "resume_url", width: 30 },
    ];

    data.forEach((row) => sheet.addRow(row));

    // Return buffer for download
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
},

 async getApplicationByUser(userId){
  const data = await applicationRepository.findApplicationByUser(userId);
  return data;
 }

  
};
