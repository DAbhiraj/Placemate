import express from "express";
import CompanyController from "./controllers/companyController.js";
import AlumniController from "./controllers/alumniController.js";

const router = express.Router();

router.get("/companies", CompanyController.getCompanies);
router.get("/companies/:id", CompanyController.getCompany);
router.post("/companies", CompanyController.createCompany);
router.get("/alumni", AlumniController.getAll);
router.post("/alumni", AlumniController.create);

export default router;
