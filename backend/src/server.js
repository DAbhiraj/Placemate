
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import express from "express";
import cors from "cors";
import router from "./routes.js";
import path from "path";


const app = express();


app.use(cors({
 origin: ["http://localhost:5173","https://placemate-seven.vercel.app/"], // your React frontend URL
 methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Enable JSON parsing
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));