import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { query } from "../db/db.js";

dotenv.config();

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

// Register user
export async function register(req, res) {
    try {
      const { name, email, password, branch, cgpa, role } = req.body;

      console.log("📥 In register route", req.body);

      if (!name || !email || !password || !branch || !cgpa) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await query("SELECT * FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique ID
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

      // Default role
      const userRole = role === "ADMIN" ? "Admin" : "Student";

      // Insert into DB
      await query(
        "INSERT INTO users (id, name, branch, cgpa, email, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, name, branch, cgpa, email, hashedPassword, userRole]
      );

      // Generate JWT token
      const token = jwt.sign(
        { email, id, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      console.log("✅ User registered:", email);

      res.status(201).json({
        message: "Registration successful",
        token,
        user: { id, name, branch, cgpa, email, role: userRole }
      });
      console.log(cgpa);
    } catch (error) {
      console.error("❌ Error in register:", error);
      res.status(500).json({ message: "Server error" });
    }
}

// Login user
export async function login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("In login route", req.body);

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) return res.status(404).json({ message: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { email: user.email, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      console.log("✅ User logged in:", email);
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cgpa : user.cgpa,
          branch : user.branch
        }
      });
    } catch (error) {
      console.error("❌ Error in login:", error);
      res.status(500).json({ message: "Server error" });
    }
}

// Google Sign-In
export async function googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      //console.log("📥 In googleLogin route", googleClient);
      if (!googleClient) {
        return res.status(500).json({ message: "Google client not configured" });
      }
      if (!idToken) return res.status(400).json({ message: "Missing idToken" });

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const firstName = payload.given_name || null;
      const lastName = payload.family_name || null;
      const fullName = payload.name || `${firstName || ""} ${lastName || ""}`.trim();

      const existing = await query(
        "SELECT * FROM users WHERE google_id = $1 OR email = $2",
        [googleId, email]
      );
      let user = existing.rows[0];

      if (!user) {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const insert = await query(
          `INSERT INTO users (id, email, role, google_id, first_name, last_name, name, profile_completed)
           VALUES ($1, $2, 'Student', $3, $4, $5, $6, false)
           RETURNING *`,
          [id, email, googleId, firstName, lastName, fullName]
        );
        user = insert.rows[0];
      }

      const token = jwt.sign(
        { email: user.email, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

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
          cgpa: user.cgpa
        }
      });
    } catch (error) {
      console.error("❌ Error in googleLogin:", error);
      res.status(500).json({ message: "Server error" });
    }
}
