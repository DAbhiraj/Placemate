-- Messages within a conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
    message_id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread_recipient ON conversation_messages (recipient_id, is_read);
