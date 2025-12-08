// src/services/applicationService.js

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
    console.log(studentId);
    console.log(jobId);
    console.log(answers);
    console.log(resumeUrl);
    const existing = await applicationRepository.findByStudentAndJob(studentId, jobId);
    let application;

    if (existing) {
      application = await applicationRepository.update(existing.appl_id, answers, resumeUrl);
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
  
  // 👇 NEW FUNCTION: Get dashboard data
  getDashboardData: async (studentId) => {
    const profile = await applicationRepository.getStudentProfile(studentId); 
    
    if (!profile) {
        throw new Error("Student profile not found. Cannot determine job eligibility.");
    }
    
    const { branch, cgpa } = profile; 
    
    const dashboardData = await applicationRepository.getStudentDashboardData(
        studentId, 
        branch, 
        cgpa
    );
    
    return dashboardData;
  },

  generateCompanyReport: async (companyName) => {
    const applications = await applicationRepository.getApplicationsByCompany(companyName);
    if (applications.length === 0) return null;
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');
  
    worksheet.columns = [
      { header: 'Application ID', key: 'appl_id', width: 15 },
      { header: 'Applicant Name', key: 'applicant_name', width: 20 },
      { header: 'Email', key: 'applicant_email', width: 25 },
      { header: 'Company Name', key: 'company_name', width: 20 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Package Range', key: 'package', width: 15 },
      { header: 'Status', key: 'application_status', width: 15 },
      { header: 'Resume URL', key: 'resume_url', width: 30 },
      { header: 'Applied At', key: 'created_at', width: 20 },
    ];
  
    applications.forEach(app => worksheet.addRow(app));
  
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};