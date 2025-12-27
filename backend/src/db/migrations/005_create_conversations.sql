-- Conversations between SPOC and Recruiter per job
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    spoc_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recruiter_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_conversation UNIQUE (job_id, spoc_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_spoc ON conversations (spoc_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job ON conversations (job_id);
