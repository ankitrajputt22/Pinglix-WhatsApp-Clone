package in.pinglix.message.dto;

import java.time.Instant;
import java.util.List;

import in.pinglix.message.MessageStatus;

public record MessageStatusUpdateResponse(
        Long conversationId,
        MessageStatus status,
        List<Long> messageIds,
        int updatedCount,
        Instant updatedAt
) {
}
