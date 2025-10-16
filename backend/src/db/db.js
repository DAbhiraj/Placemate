// src/db/db.js
import path from "path";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const { Pool } = pkg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon connection string
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test DB connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to Neon PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
  }
})();

export const query = (text, params) => pool.query(text, params);
export { pool };
