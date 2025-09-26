import pkg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

try {
   
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

  const client = await pool.connect();
  console.log("Connected to Neon DB ✅");
  const result = await client.query("SELECT version()");
  console.log("Postgres version:", result.rows[0].version);
  client.release();
} catch (err) {
  console.error("Connection failed ❌", err);
}
