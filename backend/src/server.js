// src/server.js
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes.js";
import fs from "fs";
import initJobStatusScheduler from "./utils/jobStatusScheduler.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://placemate-seven.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(cookieParser());

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

// Initialize job status auto-update scheduler
initJobStatusScheduler();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
