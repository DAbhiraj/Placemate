// src/routes.js
import express from "express";
import multer from "multer";
import AuthController from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";
import applicationController from "./controllers/applicationController.js";
import { jobController } from "./controllers/jobController.js";
import { adminController } from "./controllers/adminController.js";
import { notificationController } from "./controllers/notificationController.js";

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

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// applications
router.get("/applications/userId/:userId", applicationController.getApplicationByUser);
router.get("/applications/excel/:jobId/export", applicationController.exportExcel);
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

// admin routes
// Company Management
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

// User Notifications
router.get("/notifications/:userId", notificationController.getUserNotifications);
router.put("/notifications/:notificationId/read", notificationController.markNotificationAsRead);

export default router;
