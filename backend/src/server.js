// src/server.js
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import router from "./routes.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://placemate-seven.vercel.app/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// Routes
app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
