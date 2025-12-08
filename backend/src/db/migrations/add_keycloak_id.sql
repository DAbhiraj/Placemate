-- Migration: Add keycloak_id column to users table
-- This allows mapping between database user_id and Keycloak user ID

ALTER TABLE users ADD COLUMN keycloak_id VARCHAR(255) UNIQUE;

-- Create index for faster lookups by keycloak_id
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
