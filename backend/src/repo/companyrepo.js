
import { query } from "../db/db.js";
import { v4 as uuidv4 } from "uuid"; // for generating unique IDs

const CompanyRepo = {
  async getAll() {
    console.log("came to get Companies repo");
    try {
      const result = await query("SELECT * FROM companies");
      console.log("got results");
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
    const result = await query("SELECT * FROM companies WHERE id = $1", [id]);
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
      deadline,
      job_type,
      description,
      requirements = [],
      applied_count = 0
    } = company;

    const id = uuidv4(); // generate unique id

    const result = await query(
      `INSERT INTO companies
        (id, name, logo, package, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements, applied_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        id,
        name,
        logo,
        pkg,
        location,
        eligible_branches,
        min_cgpa,
        deadline,
        job_type,
        description,
        requirements,
        applied_count
      ]
    );

    return result.rows[0];
  }
};

export default CompanyRepo;
