import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { query } from "../db/db.js";

dotenv.config();

const AuthController = {
  // ✅ Register user
  async register(req, res) {
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

    // Default role to Student unless explicitly Admin
    console.log(role);
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

    // Send full user info (for localStorage)
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id,
        name,
        branch,
        cgpa,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("❌ Error in register:", error);
    res.status(500).json({ message: "Server error" });
  }
},


  // ✅ Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("📥 In login route", req.body);

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check user
      const result = await query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
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
          branch: user.branch,
          cgpa: user.cgpa,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("❌ Error in login:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

export default AuthController;
