package in.pinglix.auth;

import in.pinglix.auth.AuthService.AuthSession;
import in.pinglix.auth.dto.AuthUserResponse;
import in.pinglix.auth.dto.LoginRequest;
import in.pinglix.auth.dto.MessageResponse;
import in.pinglix.auth.dto.RegisterRequest;
import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.security.CookieService;
import in.pinglix.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;

    public AuthController(AuthService authService, CookieService cookieService) {
        this.authService = authService;
        this.cookieService = cookieService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthUserResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        return setSessionCookies(authService.register(request), response);
    }

    @PostMapping("/login")
    public AuthUserResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        return setSessionCookies(authService.login(request), response);
    }

    @PostMapping("/refresh")
    public AuthUserResponse refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = cookieService.readRefreshToken(request)
                .orElseThrow(AuthenticationRequiredException::new);

        try {
            return setSessionCookies(authService.refresh(refreshToken), response);
        } catch (AuthenticationRequiredException exception) {
            cookieService.clearAuthenticationCookies(response);
            throw exception;
        }
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal CustomUserDetails principal) {
        return authService.currentUser(principal);
    }

    @PostMapping("/logout")
    public MessageResponse logout(
            @AuthenticationPrincipal CustomUserDetails principal,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }

        try {
            authService.logout(
                    cookieService.readRefreshToken(request).orElse(null),
                    principal.id()
            );
        } finally {
            cookieService.clearAuthenticationCookies(response);
        }

        return new MessageResponse("Logged out successfully");
    }

    private AuthUserResponse setSessionCookies(
            AuthSession session,
            HttpServletResponse response
    ) {
        cookieService.writeAuthenticationCookies(
                response,
                session.accessToken(),
                session.refreshToken()
        );
        return session.user();
    }
}
