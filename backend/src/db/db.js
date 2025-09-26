import path from "path";
import dotenv from "dotenv";
// load env from root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import pkg from "pg";
const { Pool } = pkg;


const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
 max: 10,
 idleTimeoutMillis: 30000,
 connectionTimeoutMillis: 10000 
});

export const query = (text, params) => pool.query(text, params);
export { pool };