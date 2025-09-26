import CompanyService from "../services/companyservice.js";

const CompanyController = {
  async getCompanies(req, res) {
    try {
      console.log("came to get Companies controller");
      const companies = await CompanyService.listCompanies();
      res.json(companies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCompany(req, res) {
    try {
      const company = await CompanyService.getCompany(req.params.id);
      if (!company) return res.status(404).json({ error: "Company not found" });
      res.json(company);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createCompany(req, res) {
    try {
      const newCompany = await CompanyService.addCompany(req.body);
      res.status(201).json(newCompany);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default CompanyController;
