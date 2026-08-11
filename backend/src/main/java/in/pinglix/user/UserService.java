package in.pinglix.user;

import java.util.List;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.dto.CurrentUserResponse;
import in.pinglix.user.dto.UpdateProfileRequest;
import in.pinglix.user.dto.UserResponse;
import in.pinglix.user.exception.InvalidUserSearchException;
import in.pinglix.user.exception.InvalidProfileRequestException;
import in.pinglix.user.exception.UserNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final int MAX_SEARCH_RESULTS = 20;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(CustomUserDetails principal) {
        Long currentUserId = requireUserId(principal);
        User user = findAvailableUser(currentUserId);
        return UserMapper.toCurrentUserResponse(user);
    }

    @Transactional
    public CurrentUserResponse updateProfile(
            CustomUserDetails principal,
            UpdateProfileRequest request
    ) {
        Long currentUserId = requireUserId(principal);
        User user = findAvailableUser(currentUserId);
        String displayName = request.displayName().trim();
        if (displayName.length() < 2) {
            throw new InvalidProfileRequestException(
                    "Display name must be 2 to 50 characters"
            );
        }
        user.updateProfile(
                displayName,
                normalizeOptional(request.about()),
                normalizeProfileImageUrl(request.profileImageUrl())
        );
        return UserMapper.toCurrentUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(
            CustomUserDetails principal,
            String rawQuery
    ) {
        Long currentUserId = requireUserId(principal);
        String query = validateAndEscapeQuery(rawQuery);

        return userRepository.searchAvailableUsers(
                        currentUserId,
                        query,
                        PageRequest.of(0, MAX_SEARCH_RESULTS)
                ).stream()
                .map(UserMapper::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(
            CustomUserDetails principal,
            Long userId
    ) {
        requireUserId(principal);
        return UserMapper.toUserResponse(findAvailableUser(userId));
    }

    private User findAvailableUser(Long userId) {
        return userRepository.findAvailableById(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private Long requireUserId(CustomUserDetails principal) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }

        return principal.id();
    }

    private String validateAndEscapeQuery(String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();

        if (query.length() < 2) {
            throw new InvalidUserSearchException(
                    "Search query must be at least 2 characters"
            );
        }

        if (query.length() > 100) {
            throw new InvalidUserSearchException(
                    "Search query must be at most 100 characters"
            );
        }

        return query
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeProfileImageUrl(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        if (!normalized.matches("https?://\\S+")) {
            throw new InvalidProfileRequestException(
                    "Profile image URL must be a valid URL"
            );
        }
        return normalized;
    }
}
