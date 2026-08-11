CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    client_message_id VARCHAR(100) NOT NULL,
    message_type VARCHAR(30) NOT NULL,
    content TEXT NULL,
    reply_to_message_id BIGINT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    deleted_for_everyone_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_messages_sender_client_message (sender_id, client_message_id),
    KEY idx_messages_conversation_created_id (conversation_id, created_at, id),
    KEY idx_messages_sender_id (sender_id),
    KEY idx_messages_reply_to_message_id (reply_to_message_id),
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users (id),
    CONSTRAINT fk_messages_reply_to_message
        FOREIGN KEY (reply_to_message_id) REFERENCES messages (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE conversations
    ADD CONSTRAINT fk_conversations_last_message
        FOREIGN KEY (last_message_id) REFERENCES messages (id);
