package in.pinglix.user.dto;

import java.time.Instant;

import in.pinglix.user.AccountStatus;

public record CurrentUserResponse(
        Long id,
        String email,
        String displayName,
        String profileImageUrl,
        String about,
        AccountStatus accountStatus,
        Instant createdAt,
        Instant lastSeenAt
) {
}
