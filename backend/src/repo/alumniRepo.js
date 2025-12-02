import { query } from "../db/db.js";

const AlumniRepo = {
  async getAll() {
    const result = await query("SELECT * FROM alumni_stories ORDER BY alum_id ASC");
    return result.rows;
  },
  

  async create(alumni) {
    const { name, batch, branch, company, package: pkg, image, currentRole, story, tips } = alumni;

    const result = await query(
      `INSERT INTO alumni_stories 
       (name, batch, branch, company, package, image, currentRole, story, tips) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING *`,
      [name, batch, branch, company, pkg, image, currentRole, story, tips]
    );

    return result.rows[0];
  }
}

export default AlumniRepo;
