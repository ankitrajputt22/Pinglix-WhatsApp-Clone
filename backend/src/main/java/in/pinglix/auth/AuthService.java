package in.pinglix.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

import in.pinglix.auth.dto.AuthUserResponse;
import in.pinglix.auth.dto.LoginRequest;
import in.pinglix.auth.dto.RegisterRequest;
import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.auth.exception.DuplicateEmailException;
import in.pinglix.auth.exception.InvalidCredentialsException;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.security.JwtService;
import in.pinglix.security.SecurityProperties;
import in.pinglix.user.AccountStatus;
import in.pinglix.user.User;
import in.pinglix.user.UserMapper;
import in.pinglix.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecurityProperties securityProperties;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SecurityProperties securityProperties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.securityProperties = securityProperties;
    }

    @Transactional
    public AuthSession register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException();
        }

        User user = userRepository.save(new User(
                email,
                passwordEncoder.encode(request.password()),
                request.displayName().trim()
        ));
        AuthSession session = issueSession(user);
        log.info("Registered Pinglix user {}", user.getId());
        return session;
    }

    @Transactional
    public AuthSession login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(InvalidCredentialsException::new);

        if (!canAuthenticate(user)
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.recordLogin(Instant.now());
        AuthSession session = issueSession(user);
        log.info("Authenticated Pinglix user {}", user.getId());
        return session;
    }

    @Transactional
    public AuthSession refresh(String rawRefreshToken) {
        Instant now = Instant.now();
        RefreshToken currentToken = refreshTokenRepository
                .findByTokenHashForUpdate(hashToken(rawRefreshToken))
                .orElseThrow(AuthenticationRequiredException::new);

        if (!currentToken.isUsableAt(now) || !canAuthenticate(currentToken.getUser())) {
            throw new AuthenticationRequiredException();
        }

        TokenPair replacementPair = createTokenPair(currentToken.getUser());
        RefreshToken replacement = refreshTokenRepository.save(new RefreshToken(
                currentToken.getUser(),
                hashToken(replacementPair.refreshToken()),
                now.plus(securityProperties.refreshTokenTtl())
        ));
        currentToken.revoke(now, replacement);
        refreshTokenRepository.save(currentToken);

        log.info("Rotated refresh token for Pinglix user {}", currentToken.getUser().getId());
        return new AuthSession(
                UserMapper.toAuthResponse(currentToken.getUser()),
                replacementPair.accessToken(),
                replacementPair.refreshToken()
        );
    }

    @Transactional(readOnly = true)
    public AuthUserResponse currentUser(CustomUserDetails principal) {
        if (principal == null) {
            throw new AuthenticationRequiredException();
        }

        User user = userRepository.findById(principal.id())
                .filter(this::canAuthenticate)
                .orElseThrow(AuthenticationRequiredException::new);
        return UserMapper.toAuthResponse(user);
    }

    @Transactional
    public void logout(String rawRefreshToken, Long userId) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHashForUpdate(hashToken(rawRefreshToken))
                    .filter(token -> token.getUser().getId().equals(userId))
                    .filter(token -> token.getRevokedAt() == null)
                    .ifPresent(token -> token.revoke(Instant.now(), null));
        }

        log.info("Logged out Pinglix user {}", userId);
    }

    private AuthSession issueSession(User user) {
        TokenPair pair = createTokenPair(user);
        refreshTokenRepository.save(new RefreshToken(
                user,
                hashToken(pair.refreshToken()),
                Instant.now().plus(securityProperties.refreshTokenTtl())
        ));
        return new AuthSession(
                UserMapper.toAuthResponse(user),
                pair.accessToken(),
                pair.refreshToken()
        );
    }

    private TokenPair createTokenPair(User user) {
        byte[] refreshBytes = new byte[32];
        secureRandom.nextBytes(refreshBytes);
        String refreshToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(refreshBytes);
        return new TokenPair(jwtService.createAccessToken(user), refreshToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean canAuthenticate(User user) {
        if (user.getDeletedAt() != null
                || user.getAccountStatus() == AccountStatus.DELETED
                || user.getAccountStatus() == AccountStatus.DISABLED) {
            return false;
        }

        return user.getAccountStatus() != AccountStatus.LOCKED
                && (user.getLockedUntil() == null
                || !user.getLockedUntil().isAfter(Instant.now()));
    }

    public record AuthSession(
            AuthUserResponse user,
            String accessToken,
            String refreshToken
    ) {
    }

    private record TokenPair(String accessToken, String refreshToken) {
    }
}
