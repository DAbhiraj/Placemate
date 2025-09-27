import AlumniRepo from "../repo/alumniRepo.js";

const AlumniService = {
  async getAllAlumni() {
    return await AlumniRepo.getAll();
  },

  async addAlumni(alumniData) {
    return await AlumniRepo.create(alumniData);
  }
}

export default AlumniService;
