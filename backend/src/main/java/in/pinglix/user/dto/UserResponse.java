package in.pinglix.user.dto;

public record UserResponse(
        Long id,
        String email,
        String displayName,
        String profileImageUrl,
        String about
) {
}
