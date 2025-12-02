// src/routes.js
import express from "express";
import multer from "multer";
import { register, login, googleLogin } from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";
import { ProfileController, uploadMiddleware } from "./controllers/profileController.js";
import applicationController from "./controllers/applicationController.js";
import { jobController } from "./controllers/jobController.js";
import jwt from "jsonwebtoken";
import { notificationController } from "./controllers/notificationController.js";
import { adminController } from "./controllers/adminController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware for authentication (mock)
router.use((req, res, next) => {
  req.user = { id: 1 }; // student
  next();
});


router.get("/notifications/:userId",notificationController.getUserNotifications);
router.get("/notifications/:userId/unread",notificationController.getUnreadCount);
router.put("/notifications/:notificationId/read",notificationController.markNotificationAsRead);
router.get("/notifications/role/:role",notificationController.getNotificationsByRole);
router.post("/notifications/send-by-role",notificationController.sendNotificationByRole);
router.get("/notifications/all",notificationController.getAllNotifications);

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/google", googleLogin);

router.post("/register", register);
router.post("/login", login);

// applications
router.get('/exports', applicationController.downloadCompanyReport);
router.get("/upcoming-deadlines/:userId",applicationController.getUpcomingDeadline);
router.get("/applications/userId/:userId", applicationController.getApplicationByUser);
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
router.put("/profile/:profileId",  ProfileController.updateProfile);
router.put("/profile/skills/:userId",  ProfileController.updateSkills);
router.post("/profile/resume",  uploadMiddleware, ProfileController.uploadResume);
router.get("/profile/resume",  ProfileController.getResume);
router.delete("/profile/resume",  ProfileController.deleteResume);
router.get("/profile/ats-score",  ProfileController.getATSScore);
router.post("/profile/onboarding",  uploadMiddleware, ProfileController.onboarding);

// Parse resume endpoint (returns parsed JSON from resume)
router.post("/parse-resume", uploadMiddleware, ProfileController.parseResume);

router.post("/admin/companies", adminController.createCompany);
router.get("/admin/companies", adminController.getCompanies);
router.put("/admin/companies/:id", adminController.updateCompany);
router.delete("/admin/companies/:id", adminController.deleteCompany);

// Job Management
router.post("/admin/jobs", adminController.createJob);
router.get("/admin/jobs", adminController.getJobs);
router.put("/admin/jobs/:id", adminController.updateJob);
router.delete("/admin/jobs/:id", adminController.deleteJob);

// Application Management
router.get("/admin/jobs/:jobId/applications", adminController.getApplicationsForJob);
router.put("/admin/applications/:applicationId/status", adminController.updateApplicationStatus);
router.put("/admin/jobs/:jobId/applications/bulk-status", adminController.updateBulkApplicationStatus);

// Dashboard & Stats
router.get("/admin/dashboard/stats", adminController.getDashboardStats);

// Student Management
router.get("/admin/students", adminController.getAllStudents);
router.put("/admin/students/:studentId/status", adminController.updateStudentStatus);

// Notification Management
router.post("/admin/send-notification", upload.single('excelFile'), adminController.sendNotification);
router.post("/admin/send-notification-roles", adminController.sendNotificationToRoles);

export default router;
