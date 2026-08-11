package in.pinglix.user;

import java.util.List;

import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.dto.CurrentUserResponse;
import in.pinglix.user.dto.UserResponse;
import in.pinglix.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public CurrentUserResponse me(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        return userService.getCurrentUser(principal);
    }

    @PatchMapping("/me")
    public CurrentUserResponse updateProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(principal, request);
    }

    @GetMapping("/search")
    public List<UserResponse> search(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(name = "query", required = false) String query
    ) {
        return userService.searchUsers(principal, query);
    }

    @GetMapping("/{id}")
    public UserResponse getById(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id
    ) {
        return userService.getUserById(principal, id);
    }
}
