// src/routes.js
import express from "express";
import multer from "multer";
import {linkedinLogin } from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";
import { ProfileController, uploadMiddleware } from "./controllers/profileController.js";
import applicationController from "./controllers/applicationController.js";
import { jobController } from "./controllers/jobController.js";
import jwt from "jsonwebtoken";
import { notificationController } from "./controllers/notificationController.js";
import { adminController } from "./controllers/adminController.js";
import { recruiterController } from "./controllers/recruiterController.js";
import { spocController } from "./controllers/spocController.js";
import { recruiterKycController } from "./controllers/recruiterKycController.js";
import { messagesController } from "./controllers/messagesController.js";
import { keycloakAuthController } from "./controllers/keycloakAuthController.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { uploadController } from "./controllers/uploadController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/auth/register", keycloakAuthController.register);
router.post("/auth/login", keycloakAuthController.login);
router.post("/auth/refresh", keycloakAuthController.refresh);
router.post("/auth/logout", keycloakAuthController.logout);
router.get("/auth/me", keycloakAuthController.me);
router.post("/auth/google", keycloakAuthController.googleLogin);
router.post("/auth/linkedin", linkedinLogin);

router.use(requireAuth);

router.get("/notifications",notificationController.getUserNotifications);
router.get("/notifications/unread",notificationController.getUnreadCount);
router.put("/notifications/:notificationId/read",notificationController.markNotificationAsRead);
router.delete("/notifications/:notificationId",notificationController.deleteNotification);
router.get("/notifications/role/:role",notificationController.getNotificationsByRole);
router.post("/notifications/send-by-role",notificationController.sendNotificationByRole);
router.get("/notifications/all",notificationController.getAllNotifications);

// applications
router.get("/applications/dashboard", applicationController.getDashboardData);
router.get('/exports', applicationController.downloadCompanyReport);
// router.get("/upcoming-deadlines",applicationController.getUpcomingDeadline);
router.get("/applications", applicationController.getApplicationByUser);
router.get("/applications/:jobId", applicationController.getFormData);
router.post("/applications/:jobId/apply/:studentId", applicationController.submitForm);

// jobs
router.post("/jobs", jobController.createJob);
router.get("/jobs", jobController.getJobs);
router.get("/jobs/:id", jobController.getJob);

// companies
router.get("/companies", CompanyController.getCompanies);
router.get("/companies/:id", CompanyController.getCompany);
router.post("/companies", CompanyController.createCompany);

// alumni
router.get("/alumni", AlumniController.getAll);
router.post("/alumni", AlumniController.create);

// --- Profile Routes ---
router.get("/profile", ProfileController.getProfile);
router.put("/profile/",  ProfileController.updateProfile);
router.put("/profile/skills/",  ProfileController.updateSkills);
router.post("/profile/resume",  uploadMiddleware, ProfileController.uploadResume);
router.get("/profile/resume",  ProfileController.getResume);
router.delete("/profile/resume",  ProfileController.deleteResume);
// router.get("/profile/ats-score",  ProfileController.getATSScore);
router.post("/profile/onboarding",  uploadMiddleware, ProfileController.onboarding);

// Parse resume endpoint (returns parsed JSON from resume)
router.post("/parse-resume", uploadMiddleware, ProfileController.parseResume);

router.post("/admin/companies", adminController.createCompany);
router.get("/admin/companies", adminController.getCompanies);
router.put("/admin/companies/:id", adminController.updateCompany);
router.delete("/admin/companies/:id", adminController.deleteCompany);

// Job Management
router.post("/recruiter/jobs", recruiterController.createJob);
router.get("/recruiter/jobs", recruiterController.getJobs);
router.get("/recruiter", recruiterController.getRecruiter);
router.get("/recruiter/jobs/:company", recruiterController.getJobsByCompany);
router.put("/recruiter/jobs/:id", recruiterController.updateJob);
router.delete("/recruiter/jobs/:id", recruiterController.deleteJob);

// Application Management
router.get("/jobs/:jobId/applications", recruiterController.getApplicationsForJob);
router.put("/admin/applications/:applicationId/status", adminController.updateApplicationStatus);
router.put("/admin/jobs/:jobId/applications/bulk-status", adminController.updateBulkApplicationStatus);

// Dashboard & Stats
router.get("/admin/dashboard/stats", adminController.getDashboardStats);

// Student Management
router.get("/admin/students", adminController.getAllStudents);
router.get("/admin/spocs", adminController.getAllSpocs);
router.get("/admin/search-users", adminController.searchUsers);
router.post("/admin/spoc/add", adminController.addSpoc);
router.post("/admin/spocs/assigned-jobs", adminController.getSpocAssignedJobs);
router.delete("/admin/spocs/:spocId", adminController.removeSpoc);
router.delete("/admin/spocs/:spocId/jobs/:jobId", adminController.removeSpocAssignment);
router.put("/admin/students/:studentId/status", adminController.updateStudentStatus);

// Protect all routes below

router.post("/admin/send-notification", upload.single('excelFile'), adminController.sendNotification);
router.post("/admin/send-notification-roles", adminController.sendNotificationToRoles);

// SPOC Routes
router.get("/spoc/assigned-jobs", spocController.getAssignedJobs);
router.post("/spoc/assign-job", spocController.assignJob);
router.put("/spoc/jobs/:jobId/job-status", spocController.updateJobStatus);
router.put("/spoc/jobs/:jobId/messages", spocController.updateMessageCount);
router.put("/spoc/jobs/:jobId/changes", spocController.updateHasChanges);
router.delete("/spoc/jobs/:jobId", spocController.removeAssignment);

// SPOC Messaging Routes
router.get("/spoc/conversations", messagesController.listConversations);
router.post("/spoc/jobs/:jobId/conversation", messagesController.ensureConversation);
router.get("/conversations/:conversationId/messages", messagesController.getMessages);
router.post("/conversations/:conversationId/messages", messagesController.sendMessage);

// System Job Status Auto-Update (cron job endpoint)
router.post("/system/auto-update-job-statuses", spocController.autoUpdateJobStatuses);

// Recruiter KYC Routes
router.post("/recruiter/kyc", recruiterKycController.submitKyc);
router.get("/recruiter/kyc", recruiterKycController.getKyc);
router.get("/admin/recruiter-kyc/pending", recruiterKycController.getPendingKyc);
router.get("/admin/recruiter-kyc/verified", recruiterKycController.getAllVerifiedKyc);
router.get("/admin/recruiter-kyc/rejected", recruiterKycController.getAllRejectedKyc);
router.put("/admin/recruiter-kyc/:kycId/approve", recruiterKycController.approveKyc);
router.put("/admin/recruiter-kyc/:kycId/reject", recruiterKycController.rejectKyc);

// Upload Routes
router.post("/upload/document", upload.single('file'), uploadController.uploadDocument);

export default router;