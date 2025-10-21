// src/routes.js
import express from "express";
import { register, login, googleLogin } from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";
import { ProfileController, uploadMiddleware } from "./controllers/profileController.js";
import applicationController from "./controllers/applicationController.js";
import { jobController } from "./controllers/jobController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/google", googleLogin);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

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
router.get("/profile", authenticateToken, ProfileController.getProfile);
router.put("/profile", authenticateToken, ProfileController.updateProfile);
router.put("/profile/skills", authenticateToken, ProfileController.updateSkills);
router.post("/profile/resume", authenticateToken, uploadMiddleware, ProfileController.uploadResume);
router.get("/profile/resume", authenticateToken, ProfileController.getResume);
router.delete("/profile/resume", authenticateToken, ProfileController.deleteResume);
router.get("/profile/ats-score", authenticateToken, ProfileController.getATSScore);
router.post("/profile/onboarding", authenticateToken, uploadMiddleware, ProfileController.onboarding);

export default router;
