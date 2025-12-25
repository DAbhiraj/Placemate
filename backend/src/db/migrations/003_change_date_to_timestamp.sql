-- Migration: Change application_deadline and online_assessment_date from DATE to TIMESTAMP
-- This allows storing both date and time for more precise deadlines

-- Change application_deadline from DATE to TIMESTAMP
ALTER TABLE jobs 
ALTER COLUMN application_deadline TYPE TIMESTAMP USING application_deadline::TIMESTAMP;

-- Change online_assessment_date from DATE to TIMESTAMP
ALTER TABLE jobs 
ALTER COLUMN online_assessment_date TYPE TIMESTAMP USING online_assessment_date::TIMESTAMP;

-- Update any existing NULL values to remain NULL (no action needed, just documenting)
-- Future inserts should use full timestamp format: 'YYYY-MM-DD HH:MM:SS'

COMMENT ON COLUMN jobs.application_deadline IS 'Application deadline with time (TIMESTAMP)';
COMMENT ON COLUMN jobs.online_assessment_date IS 'Online assessment date and time (TIMESTAMP)';
