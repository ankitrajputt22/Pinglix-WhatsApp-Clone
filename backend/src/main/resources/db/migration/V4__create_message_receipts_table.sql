CREATE TABLE message_receipts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    message_id BIGINT NOT NULL,
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_message_receipts_message_user (message_id, user_id),
    KEY idx_message_receipts_conversation_user (conversation_id, user_id),
    KEY idx_message_receipts_user_read (user_id, read_at),
    KEY idx_message_receipts_message_id (message_id),
    CONSTRAINT fk_message_receipts_message
        FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
    CONSTRAINT fk_message_receipts_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_message_receipts_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
