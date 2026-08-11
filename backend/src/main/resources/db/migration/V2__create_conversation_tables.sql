CREATE TABLE conversations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NULL,
    image_url VARCHAR(500) NULL,
    created_by BIGINT NOT NULL,
    last_message_id BIGINT NULL,
    last_message_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_conversations_created_by (created_by),
    KEY idx_conversations_last_message_at (last_message_at),
    CONSTRAINT fk_conversations_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE conversation_members (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    member_role VARCHAR(30) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    last_read_message_id BIGINT NULL,
    muted_until TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    pinned_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_conversation_members_conversation_user (conversation_id, user_id),
    KEY idx_conversation_members_user_conversation (user_id, conversation_id),
    KEY idx_conversation_members_conversation_id (conversation_id),
    CONSTRAINT fk_conversation_members_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    CONSTRAINT fk_conversation_members_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE private_conversations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    user_one_id BIGINT NOT NULL,
    user_two_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_private_conversations_user_pair (user_one_id, user_two_id),
    UNIQUE KEY uk_private_conversations_conversation_id (conversation_id),
    KEY idx_private_conversations_user_one (user_one_id),
    KEY idx_private_conversations_user_two (user_two_id),
    CONSTRAINT chk_private_conversations_ordered_pair
        CHECK (user_one_id < user_two_id),
    CONSTRAINT fk_private_conversations_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    CONSTRAINT fk_private_conversations_user_one
        FOREIGN KEY (user_one_id) REFERENCES users (id),
    CONSTRAINT fk_private_conversations_user_two
        FOREIGN KEY (user_two_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
