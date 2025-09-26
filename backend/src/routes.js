import express from "express";
import CompanyController from "./controllers/companyController.js";

const router = express.Router();

router.get("/companies", CompanyController.getCompanies);
router.get("/companies/:id", CompanyController.getCompany);
router.post("/companies", CompanyController.createCompany);

export default router;
