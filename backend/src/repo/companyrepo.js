
import { query } from "../db/db.js";
import { v4 as uuidv4 } from "uuid"; // for generating unique IDs

const CompanyRepo = {
  async getAll() {
    console.log("came to get Companies repo");
    try {
      // Get distinct companies from jobs table
      const result = await query(
        `SELECT DISTINCT ON (company_name) 
          company_name as name,
          company_logo as logo,
          package,
          location,
          eligible_branches,
          min_cgpa,
          job_type,
          job_id as id
         FROM jobs
         ORDER BY company_name, job_id DESC`
      );
      console.log("got results from jobs table");
      return result.rows;
    } catch (error) {
      // ⚠️ PRINT THE FULL OBJECT ⚠️
      console.error("--- FULL DATABASE ERROR OBJECT ---");
      console.error(error); // This prints all properties, including stack trace
      console.error("----------------------------------");
      throw error;
    }
  },

  async getById(id) {
    const result = await query(
      `SELECT DISTINCT ON (company_name)
        company_name as name,
        company_logo as logo,
        package,
        location,
        eligible_branches,
        min_cgpa,
        job_type,
        job_id as id
       FROM jobs
       WHERE job_id = $1
       ORDER BY company_name, job_id DESC`,
      [id]
    );
    return result.rows[0];
  },

async create(company) {
    const {
      name,
      logo,
      package: pkg,
      location,
      eligible_branches = [],
      min_cgpa,
      application_deadline,
      job_type,
      description,
      requirements = [],
      roles = ["Software Developer"]
    } = company;

    const result = await query(
      `INSERT INTO jobs
        (company_name, company_logo, package, location, eligible_branches, min_cgpa, application_deadline, job_type, description, requirements, roles)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text[])
       RETURNING job_id as id, company_name as name, company_logo as logo, package, location, eligible_branches, min_cgpa, application_deadline as deadline, job_type, description, requirements`,
      [
        name,
        logo,
        pkg,
        location,
        eligible_branches,
        min_cgpa,
        application_deadline,
        job_type,
        description,
        requirements,
        Array.isArray(roles) ? roles : [roles]
      ]
    );

    return result.rows[0];
  }
};

export default CompanyRepo;
