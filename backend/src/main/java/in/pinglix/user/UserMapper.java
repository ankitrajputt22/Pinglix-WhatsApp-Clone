package in.pinglix.user;

import in.pinglix.auth.dto.AuthUserResponse;
import in.pinglix.user.dto.CurrentUserResponse;
import in.pinglix.user.dto.UserResponse;

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

    public static CurrentUserResponse toCurrentUserResponse(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getAbout(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getProfileImageUrl(),
                user.getAbout()
        );
    }
}
