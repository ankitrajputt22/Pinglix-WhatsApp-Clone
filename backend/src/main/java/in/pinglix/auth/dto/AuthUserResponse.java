package in.pinglix.auth.dto;

import java.time.Instant;

import in.pinglix.user.AccountStatus;

public record AuthUserResponse(
        Long id,
        String email,
        String displayName,
        String profileImageUrl,
        AccountStatus accountStatus,
        Instant createdAt
) {
}
