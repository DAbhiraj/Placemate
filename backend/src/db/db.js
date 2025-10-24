// src/db/db.js
import path from "path";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

// Base config for the pool
const connectionConfig = {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (isProduction) {
  // Production (Neon) configuration
  connectionConfig.connectionString = process.env.DATABASE_URL;
  connectionConfig.ssl = { rejectUnauthorized: false };
} else {
  // Development (Localhost) configuration
  connectionConfig.user = process.env.DB_USER;
  connectionConfig.host = process.env.DB_HOST;
  connectionConfig.database = process.env.DB_NAME;
  connectionConfig.password = process.env.DB_PASSWORD;
  connectionConfig.port = process.env.DB_PORT;
}

const pool = new Pool(connectionConfig);

// 👇 This is good, keep it
pool.on("connect", (client) => {
  client.query("SET TIME ZONE 'Asia/Kolkata';");
});

// Optional: test DB connection
(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SHOW TIME ZONE;");
    
    // Log which environment we're connected to
    if (isProduction) {
      console.log("✅ Connected to Production (Neon) PostgreSQL database");
    } else {
      console.log(`✅ Connected to Local PostgreSQL database (${process.env.DB_NAME})`);
    }
    
    console.log("🕒 Current timezone:", res.rows[0].TimeZone);
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
  }
})();

export const query = (text, params) => pool.query(text, params);
export { pool };