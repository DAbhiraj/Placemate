// src/controllers/profileController.js
import { ProfileService } from "../services/profileService.js";
import multer from "multer";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import { pool } from "../db/db.js";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF and DOC files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'), false);
    }
  }
});

export class ProfileController {
  /**
   * First-time onboarding: save student details and resume
   */
  static async onboarding(req, res) {
    try {
      const userId = req.user.id;
      const {
        first_name,
        last_name,
        personal_email,
        college_email,
        branch,
        roll_no,
        cgpa,
        phone,
        preferred_job_type,
        has_backlogs
      } = req.body;

        const updates = {
          first_name,
          last_name,
          personal_email,
          college_email,
          branch,
          cgpa,
          phone,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          profile_completed: true
        };

        if (preferred_job_type) {
          updates.preferred_job_type = preferred_job_type;
        }

        if (typeof has_backlogs !== 'undefined') {
          updates.has_backlogs = has_backlogs === 'no';
        }

        if (roll_no) {
          updates.roll_no = roll_no;
        }

      // Save resume if provided (multer single file)
      if (req.file) {
        const result = await ProfileService.uploadResume(userId, req.file);
        // uploadResume already updates resume + ATS in DB
      }

      const updated = await ProfileService.updateProfile(userId, updates);

      res.status(200).json({
        success: true,
        message: "Onboarding completed",
        data: updated
      });
    } catch (error) {
      console.error("Error in ProfileController.onboarding:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete onboarding",
        error: error.message
      });
    }
  }
  /**
   * Get user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log("userId in getProfile is "+userId);
      const profile = await ProfileService.getProfile(userId);
      console.log(profile);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error("Error in ProfileController.getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
        error: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      console.log("userId in updateProfile "+userId);
      console.log(updateData);
      const updatedProfile = await ProfileService.updateProfile(userId, updateData);
      
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile
      });
    } catch (error) {
      console.error("Error in ProfileController.updateProfile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message
      });
    }
  }

  /**
   * Update user skills
   */
  static async updateSkills(req, res) {
  try {
    console.log("in update skills controller"); // ✅ this should now print
    const userId = req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array"
      });
    }

    // Update skills in the DB
    const updatedSkills = await ProfileService.updateSkills(userId, skills);

    // Ensure we always send an array
    let updatedSkillsArray = [];

    if (Array.isArray(updatedSkills)) {
      updatedSkillsArray = updatedSkills;
    } else if (typeof updatedSkills === "string") {
      // Convert string from DB format {"C++","Java"} to array
      updatedSkillsArray = updatedSkills
        .replace(/^{|}$/g, '')             // remove { and }
        .split(',')                         // split by comma
        .map(s => s.trim().replace(/^"|"$/g, '')); // remove quotes and whitespace
    }

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      data: updatedSkillsArray
    });
  } catch (error) {
    console.error("Error in ProfileController.updateSkills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update skills",
      error: error.message
    });
  }
}



  /**
   * Upload resume
   */
  static async uploadResume(req, res) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      const result = await ProfileService.uploadResume(userId, req.file);
      
      res.status(200).json({
        success: true,
        message: "Resume uploaded and analyzed successfully",
        data: result
      });
    } catch (error) {
      console.error("Error in ProfileController.uploadResume:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload resume",
        error: error.message
      });
    }
  }

  /**
   * Parse resume and return extracted JSON
   */
  static async parseResume(req, res) {
      try {
        const formData = new FormData();
        formData.append("resume", req.file.buffer, req.file.originalname);

        const response = await axios.post(
          "http://127.0.0.1:7001/parse-resume",
          formData,
          {
            headers: formData.getHeaders(),
            maxBodyLength: Infinity,
          }
        );

        const parsed = response.data;
        
        console.log(parsed.data);


        const userId = req.user.id; // JWT or logged-in user
        const fullName = parsed.data.full_name;
        const branch = parsed.data.branch;
        const email = parsed.data.email?.split(",")[0].trim(); // pick first email
        const skills = parsed.data.skills ? parsed.data.skills.join(", ") : null;
        const roll_no = parsed.data.roll_number;

        let cgpa = parsed.data.cgpa;

        // Convert to float and round to 2 decimals
        if (cgpa) {
          cgpa = Number(parseFloat(cgpa).toFixed(2));
        } else {
          cgpa = null; // if no CGPA present  
        }


        // Decide application type based on roll number prefix
        // If first two chars are '23' => internship, otherwise 'fte'
        const application_type = (String(roll_no || "").slice(0,2) === "23") ? 'internship' : 'fte';

        const query = `
          UPDATE Users
          SET 
            name = $1,
            branch = $2,
            email = $3,
            skills = $4,
            resume_filename = $5,
            roll_no = $6,
            cgpa = $7,
            resume_upload_date = NOW(),
            profile_completed = 'YES',
            application_type = $8
          WHERE user_id = $9
          RETURNING *;
        `;

        const values = [
          fullName,
          branch,
          email,
          skills,
          req.file?.originalname || null,
          roll_no,
          cgpa,
          application_type,
          userId
        ];
        console.log('values');
        console.log(values);

        const result = await pool.query(query, values);

        console.log("result");
        console.log(result.rows[0]);

        return res.status(200).json({
          success: true,
          message: "Resume parsed & user profile updated",
          body : result.rows[0]
        });

  } catch (err) {
    console.error("Resume Save Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error saving parsed resume to DB",
    });
  }
}

  /**
   * Get resume file
   */
  static async getResume(req, res) {
    try {
      const userId = req.user.id;
      const resumeInfo = await ProfileService.getResumeFile(userId);
      
      // Return Cloudinary URL instead of downloading local file
      res.status(200).json({
        success: true,
        data: {
          url: resumeInfo.url,
          filename: resumeInfo.filename,
          uploadDate: resumeInfo.uploadDate
        }
      });
    } catch (error) {
      console.error("Error in ProfileController.getResume:", error);
      res.status(404).json({
        success: false,
        message: "Resume not found",
        error: error.message
      });
    }
  }

  /**
   * Delete resume
   */
  static async deleteResume(req, res) {
    try {
      const userId = req.user.id;
      const result = await ProfileService.deleteResume(userId);
      
      res.status(200).json({
        success: true,
        message: "Resume deleted successfully",
        data: result
      });
    } catch (error) {
      console.error("Error in ProfileController.deleteResume:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete resume",
        error: error.message
      });
    }
  }

  /**
   * Get ATS score
   */
  // static async getATSScore(req, res) {
  //   try {
  //     const userId = req.user.id;
  //     const profile = await ProfileService.getProfile(userId);
      
  //     if (!profile.ats_score) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "No ATS score available. Please upload a resume first."
  //       });
  //     }
      
  //     res.status(200).json({
  //       success: true,
  //       data: {
  //         score: profile.ats_score,
  //         feedback: profile.ats_feedback,
  //         date: profile.ats_score_date
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error in ProfileController.getATSScore:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to get ATS score",
  //       error: error.message
  //     });
  //   }
  // }
}

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('resume');
