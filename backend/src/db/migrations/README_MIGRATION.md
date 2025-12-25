-- Run this migration to update application_deadline and online_assessment_date to TIMESTAMP

-- To run this migration, execute:
-- psql -U your_username -d your_database -f backend/src/db/migrations/003_change_date_to_timestamp.sql

-- Or from Node.js:
-- import { pool } from './db.js';
-- const migration = await fs.readFile('./migrations/003_change_date_to_timestamp.sql', 'utf8');
-- await pool.query(migration);

-- To verify the change:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'jobs'
-- AND column_name IN ('application_deadline', 'online_assessment_date');
