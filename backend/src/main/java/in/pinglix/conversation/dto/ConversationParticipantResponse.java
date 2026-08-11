package in.pinglix.conversation.dto;

import java.time.Instant;

public record ConversationParticipantResponse(
        Long id,
        String displayName,
        String email,
        String profileImageUrl,
        String about,
        Instant lastSeenAt
) {
}
