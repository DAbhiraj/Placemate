// src/controllers/profileController.js
import { ProfileService } from "../services/profileService.js";
import multer from "multer";
import path from "path";

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
        cgpa,
        phone
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
      const profile = await ProfileService.getProfile(userId);
      
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
      const userId = req.user.id;
      const { skills } = req.body;
      
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array"
        });
      }
      
      const updatedSkills = await ProfileService.updateSkills(userId, skills);
      
      res.status(200).json({
        success: true,
        message: "Skills updated successfully",
        data: updatedSkills
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
   * Get resume file
   */
  static async getResume(req, res) {
    try {
      const userId = req.user.id;
      const resumeInfo = await ProfileService.getResumeFile(userId);
      
      res.download(resumeInfo.filepath, resumeInfo.filename);
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
  static async getATSScore(req, res) {
    try {
      const userId = req.user.id;
      const profile = await ProfileService.getProfile(userId);
      
      if (!profile.ats_score) {
        return res.status(404).json({
          success: false,
          message: "No ATS score available. Please upload a resume first."
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          score: profile.ats_score,
          feedback: profile.ats_feedback,
          date: profile.ats_score_date
        }
      });
    } catch (error) {
      console.error("Error in ProfileController.getATSScore:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get ATS score",
        error: error.message
      });
    }
  }
}

// Export multer middleware for use in routes
export const uploadMiddleware = upload.single('resume');
