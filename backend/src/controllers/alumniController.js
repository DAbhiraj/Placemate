import AlumniService from "../services/alumniService.js";

const AlumniController = {
  async getAll(req, res) {
    try {
      const alumni = await AlumniService.getAllAlumni();
      res.json(alumni);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  },

  async create(req, res) {
    try {
      const newAlumni = await AlumniService.addAlumni(req.body);
      res.status(201).json(newAlumni);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
}

export default AlumniController;
