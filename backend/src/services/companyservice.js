import CompanyRepo from "../repo/companyrepo.js";

const CompanyService = {
  async listCompanies() {
     console.log("came to get Companies service");
    return await CompanyRepo.getAll();
  },

  async getCompany(id) {
    return await CompanyRepo.getById(id);
  },

  async addCompany(data) {
    // ✅ Add validation/business logic here
    if (!data.name || !data.package) {
      throw new Error("Company name and package are required");
    }
    return await CompanyRepo.create(data);
  }
};

export default CompanyService;
