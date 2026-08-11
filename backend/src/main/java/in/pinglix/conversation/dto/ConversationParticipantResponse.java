package in.pinglix.conversation.dto;

public record ConversationParticipantResponse(
        Long id,
        String displayName,
        String email,
        String profileImageUrl,
        String about
) {
}
