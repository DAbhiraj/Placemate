// src/server.js
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import router from "./routes.js";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://placemate-seven.vercel.app/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
 // allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Static hosting for uploaded resumes
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
