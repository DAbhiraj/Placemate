// src/db/db.js
import path from "path";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 👇 Add this: run when a new client is checked out
pool.on("connect", (client) => {
  client.query("SET TIME ZONE 'Asia/Kolkata';");
});

// Optional: test DB connection
(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SHOW TIME ZONE;");
    console.log("✅ Connected to Neon PostgreSQL database");
    console.log("🕒 Current timezone:", res.rows[0].TimeZone);
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
  }
})();

export const query = (text, params) => pool.query(text, params);
export { pool };
