package in.pinglix.user;

import java.util.List;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.dto.CurrentUserResponse;
import in.pinglix.user.dto.UserResponse;
import in.pinglix.user.exception.InvalidUserSearchException;
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
}
