-- Migration to add Cloudinary support for resume uploads
-- Run this migration if you have an existing database

-- Add resume_public_id column to Users table to store Cloudinary public_id
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS resume_public_id TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN Users.resume_public_id IS 'Cloudinary public_id for the resume file, used for deletion';
