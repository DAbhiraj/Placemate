-- Migration: Add roles array to users table to support dual roles
-- This allows students to also be placement coordinators (SPOC)

-- Add roles column as TEXT array
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[];

-- Migrate existing role data to roles array
UPDATE users SET roles = ARRAY[role]::TEXT[] WHERE roles IS NULL AND role IS NOT NULL;

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);

-- Update searchUsers to exclude users who already have 'spoc' role
-- This is handled in the application code
