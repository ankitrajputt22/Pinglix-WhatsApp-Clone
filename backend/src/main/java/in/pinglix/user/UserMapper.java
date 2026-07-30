package in.pinglix.user;

import in.pinglix.auth.dto.AuthUserResponse;

public final class UserMapper {

    private UserMapper() {
    }

    public static AuthUserResponse toAuthResponse(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }
}
