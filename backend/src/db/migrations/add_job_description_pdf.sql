-- Add Cloudinary-backed job description PDF fields
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS job_description_url TEXT,
  ADD COLUMN IF NOT EXISTS job_description_public_id TEXT,
  ADD COLUMN IF NOT EXISTS job_description_filename TEXT;
