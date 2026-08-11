package in.pinglix.message.dto;

import java.time.Instant;

import in.pinglix.message.MessageStatus;
import in.pinglix.message.MessageType;

public record MessageResponse(
        Long id,
        String clientMessageId,
        Long conversationId,
        MessageSenderResponse sender,
        MessageType messageType,
        String content,
        MessageStatus status,
        Instant createdAt,
        Instant editedAt,
        Instant deletedAt
) {
}
