package in.pinglix.message.dto;

public record MessageSenderResponse(
        Long id,
        String displayName,
        String email,
        String profileImageUrl
) {
}
