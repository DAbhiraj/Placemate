import { ProfileRepo } from "../repo/profileRepo.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { InferenceClient } from "@huggingface/inference";
import { createRequire } from 'module';

// Standard Import
const require = createRequire(import.meta.url);
let pdfParse = require("pdf-parse");
pdfParse = pdfParse.pdf || pdfParse.default?.pdf || pdfParse.default || pdfParse;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId) {
    try {
      const profile = await ProfileRepo.getProfile(userId);
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile;
    } catch (error) {
      console.error("Error in ProfileService.getProfile:", error);
      throw error;
    }
  }

  /**
   * Parse resume content using pdf-parse and Hugging Face chat model
   * Returns a JSON object matching the expected schema
   */
  static async parseResume(file) {
    try {
      // 1. Validation
      if (!file || !file.buffer) {
        throw new Error("No file buffer provided");
      }

      console.log("PDF Parse Type:", typeof pdfParse); // Debug line
      // 2. Extract text (pdfParse is now a function, so we can use it directly)
      const buffer = Buffer.isBuffer(file.buffer)
  ? file.buffer
  : Buffer.from(file.buffer);  // conver JSON -> real Buffer
  console.log("Is buffer:", Buffer.isBuffer(file.buffer));
console.log("Type of file.buffer:", typeof file.buffer);
console.log(file.buffer);
      const pdfData = await pdfParse(buffer);
      const resumeText = pdfData.text || "";

      // 3. Define Schema
      const outputSchema = {
        full_name: "",
        email: "",
        phone: "",
        skills: [],
        cgpa: "",
        experience: [], // Added experience for better placement context
        education: []   // Added education
      };

      // 4. Build Prompt
      const prompt = `You are a strict JSON extractor. Extract details from the resume below.

RULES:
1. Return VALID JSON ONLY.
2. Do not include markdown formatting (no \`\`\`json).
3. Use the exact schema provided.

Schema:
${JSON.stringify(outputSchema, null, 2)}

Resume:
"""${resumeText}"""`;

      // 5. Call Hugging Face
      const client = new InferenceClient({ token: process.env.HF_TOKEN });

      const response = await client.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
        temperature: 0.1
      });

      // 6. Clean and Parse Response
      let rawContent = response.choices[0].message.content;
      
      // Clean markdown
      rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

      // Parse JSON
      let parsed = null;
      try {
        parsed = JSON.parse(rawContent);
      } catch (err) {
        // Fallback: Find first '{' and last '}'
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          parsed = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
        } else {
          throw new Error("Model response was not valid JSON");
        }
      }

      return parsed;

    } catch (error) {
      console.error("Error in ProfileService.parseResume:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    try {
      const success = await ProfileRepo.updateProfile(userId, updateData);
      if (!success) {
        throw new Error("Failed to update profile");
      }
      return await ProfileRepo.getProfile(userId);
    } catch (error) {
      console.error("Error in ProfileService.updateProfile:", error);
      throw error;
    }
  }

  /**
   * Update user skills
   */
  static async updateSkills(userId, skills) {
    try {
      const success = await ProfileRepo.updateSkills(userId, skills);
      if (!success) {
        throw new Error("Failed to update skills");
      }
      return await ProfileRepo.getSkills(userId);
    } catch (error) {
      console.error("Error in ProfileService.updateSkills:", error);
      throw error;
    }
  }

  /**
   * Upload resume and calculate ATS score
   */
  static async uploadResume(userId, file) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);
     

      // Update database
      const resumeData = {
        resume_url: `/uploads/${filename}`,
        resume_filename: file.originalname,
        resume_upload_date: new Date(),
      };

      await ProfileRepo.updateResume(userId, resumeData);

      return {
        success: true,
        resume_url: resumeData.resume_url,
      };
    } catch (error) {
      console.error("Error in ProfileService.uploadResume:", error);
      throw error;
    }
  }

  /**
   * Calculate ATS score using external API or mock implementation
   */
  // static async calculateATSScore(filepath) {
  //   try {
  //     const apiUrl = process.env.ATS_API_URL;
  //     const apiKey = process.env.ATS_API_KEY;

  //     if (apiUrl && apiKey) {
  //       // Call external ATS API
  //       // Read file buffer
  //       const fileBuffer = fs.readFileSync(filepath);

  //       // Prefer native fetch if available (Node 18+), otherwise dynamic import
  //       const doFetch = typeof fetch === "function" ? fetch : (await import("node-fetch")).default;

  //       const formDataBoundary = `----placemate-ats-boundary-${Date.now()}`;
  //       const CRLF = "\r\n";
  //       // Minimal manual multipart body to avoid extra deps
  //       const preamble = `--${formDataBoundary}${CRLF}Content-Disposition: form-data; name="file"; filename="resume.pdf"${CRLF}Content-Type: application/pdf${CRLF}${CRLF}`;
  //       const epilogue = `${CRLF}--${formDataBoundary}--${CRLF}`;
  //       const body = Buffer.concat([
  //         Buffer.from(preamble, "utf8"),
  //         fileBuffer,
  //         Buffer.from(epilogue, "utf8"),
  //       ]);

  //       const resp = await doFetch(apiUrl, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": `multipart/form-data; boundary=${formDataBoundary}`,
  //           "Authorization": `Bearer ${apiKey}`
  //         },
  //         body
  //       });

  //       if (!resp.ok) {
  //         throw new Error(`ATS API error: ${resp.status}`);
  //       }

  //       const json = await resp.json();
  //       // Expecting { score: number, feedback: string }
  //       if (typeof json.score === "number") {
  //         return {
  //           score: Math.max(0, Math.min(100, Math.round(json.score))),
  //           feedback: json.feedback || ""
  //         };
  //       }
  //     }

  //     // Fallback to mock
  //     const mockScore = this.generateMockATSScore();
  //     return mockScore;
  //   } catch (error) {
  //     console.error("Error calculating ATS score:", error);
  //     // Return default score on error
  //     return {
  //       score: 50,
  //       feedback: "Unable to analyze resume. Please try uploading again."
  //     };
  //   }
  // }

  /**
   * Generate mock ATS score for demonstration
   * In production, replace this with actual API call
   */
  // static generateMockATSScore() {
  //   // Generate random score between 60-95 for demonstration
  //   const score = Math.floor(Math.random() * 36) + 60;
    
  //   let feedback = "";
  //   if (score >= 90) {
  //     feedback = "Excellent resume! Strong keywords, clear structure, and comprehensive experience.";
  //   } else if (score >= 80) {
  //     feedback = "Good resume with solid content. Consider adding more relevant keywords and quantifying achievements.";
  //   } else if (score >= 70) {
  //     feedback = "Decent resume. Focus on adding more specific achievements and relevant skills.";
  //   } else {
  //     feedback = "Resume needs improvement. Add more relevant keywords, quantify achievements, and improve formatting.";
  //   }

  //   return {
  //     score,
  //     feedback
  //   };
  // }

  /**
   * Get resume file
   */
  static async getResumeFile(userId) {
    try {
      const profile = await ProfileRepo.getProfile(userId);
      if (!profile || !profile.resume_url) {
        throw new Error("Resume not found");
      }
      
      const filepath = path.join(__dirname, "../..", profile.resume_url);
      if (!fs.existsSync(filepath)) {
        throw new Error("Resume file not found on disk");
      }
      
      return {
        filepath,
        filename: profile.resume_filename,
        uploadDate: profile.resume_upload_date
      };
    } catch (error) {
      console.error("Error in ProfileService.getResumeFile:", error);
      throw error;
    }
  }

  /**
   * Delete resume
   */
  static async deleteResume(userId) {
    try {
      const profile = await ProfileRepo.getProfile(userId);
      if (profile && profile.resume_url) {
        const filepath = path.join(__dirname, "../..", profile.resume_url);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }

      await ProfileRepo.updateResume(userId, {
        resume_url: null,
        resume_filename: null,
        resume_upload_date: null
      });

      // await ProfileRepo.updateATSScore(userId, {
      //   ats_score: null,
      //   ats_score_date: null,
      //   ats_feedback: null
      // });

      return { success: true };
    } catch (error) {
      console.error("Error in ProfileService.deleteResume:", error);
      throw error;
    }
  }
}
