package in.pinglix.conversation.dto;

import java.time.Instant;

import in.pinglix.conversation.ConversationType;

public record ConversationResponse(
        Long id,
        ConversationType conversationType,
        String title,
        String imageUrl,
        ConversationParticipantResponse otherParticipant,
        Instant lastMessageAt,
        Instant createdAt,
        Instant updatedAt
) {
}
