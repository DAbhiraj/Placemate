// src/routes.js
import express from "express";
import { register, login } from "./controllers/authcontroller.js";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";

const router = express.Router();

// --- Auth Routes ---
router.post("/auth/register", register);
router.post("/auth/login", login);

// --- Company Routes ---
router.get("/companies", CompanyController.getCompanies);
router.get("/companies/:id", CompanyController.getCompany);
router.post("/companies", CompanyController.createCompany);

// --- Alumni Routes ---
router.get("/alumni", AlumniController.getAll);
router.post("/alumni", AlumniController.create);

export default router;
