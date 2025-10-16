// src/routes.js
import express from "express";
import AuthController from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";
import applicationController from "./controllers/applicationController.js";
import { jobController } from "./controllers/jobController.js";

const router = express.Router();

// Middleware for authentication (mock)
router.use((req, res, next) => {
  req.user = { id: 1 }; // student
  next();
});

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// applications
router.get("/applications/userId/:id",applicationController.getApplicationByUser);
router.get("/applications/excel/:jobId/export", applicationController.exportExcel);
router.get("/applications/:jobId", applicationController.getFormData);
router.post("/applications/:jobId", applicationController.submitForm);

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


export default router;
