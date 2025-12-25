import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import axios from "axios";
import { query } from "../db/db.js";

dotenv.config();

// LinkedIn Sign-In
export async function linkedinLogin(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/linkedin/callback'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user profile from LinkedIn
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const profile = profileResponse.data;
    const linkedinId = profile.sub;
    const email = profile.email;
    const firstName = profile.given_name || null;
    const lastName = profile.family_name || null;
    const fullName = profile.name || `${firstName || ""} ${lastName || ""}`.trim();

    // Check if user exists
    const result = await query(
      "SELECT user_id as id, name, email, role, linkedin_id, first_name, last_name, profile_completed, branch, cgpa, is_verified FROM users WHERE linkedin_id = $1 OR email = $2",
      [linkedinId, email]
    );
    let user = result.rows[0];

    if (!user) {
      // Create new recruiter user
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const insert = await query(
        `INSERT INTO users (user_id, email, role, linkedin_id, first_name, last_name, name, profile_completed)
         VALUES ($1, $2, 'recruiter', $3, $4, $5, $6, true)
         RETURNING user_id as id, email, role, linkedin_id, first_name, last_name, name, profile_completed, branch, cgpa, is_verified`,
        [id, email, linkedinId, firstName, lastName, fullName]
      );
      user = insert.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // If user is verified, fetch company data from KYC
    let company = null;
    const userRolesArray = user.roles || (user.role ? [user.role] : []);
    const isRecruiter = userRolesArray.some(r => r.toLowerCase() === 'recruiter');
    if (user.is_verified && isRecruiter) {
      const kycResult = await query(
        "SELECT company_name FROM recruiter_kyc WHERE recruiter_id = $1 ORDER BY created_at DESC LIMIT 1",
        [user.id]
      );
      if (kycResult.rows.length > 0) {
        company = kycResult.rows[0].company_name;
      }
    }

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_completed: user.profile_completed,
        branch: user.branch,
        cgpa: user.cgpa,
        is_verified: user.is_verified,
        company: company
      }
    });
  } catch (error) {
    console.error("❌ Error in linkedinLogin:", error);
    res.status(500).json({ 
      message: "LinkedIn authentication failed",
      error: error.response?.data || error.message 
    });
  }
}
