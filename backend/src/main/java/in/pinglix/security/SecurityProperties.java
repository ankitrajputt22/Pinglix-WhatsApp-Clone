package in.pinglix.security;

import java.time.Duration;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "pinglix.security")
public record SecurityProperties(
        @NotBlank String jwtSecret,
        @NotNull Duration accessTokenTtl,
        @NotNull Duration refreshTokenTtl,
        @NotBlank String accessCookieName,
        @NotBlank String refreshCookieName,
        boolean secureCookie,
        @NotBlank String sameSite
) {

    @AssertTrue(message = "JWT secret must contain at least 32 characters")
    public boolean isJwtSecretStrongEnough() {
        return jwtSecret != null && jwtSecret.length() >= 32;
    }

    @AssertTrue(message = "Access token TTL must be positive")
    public boolean isAccessTokenTtlPositive() {
        return accessTokenTtl != null && !accessTokenTtl.isNegative() && !accessTokenTtl.isZero();
    }

    @AssertTrue(message = "Refresh token TTL must be positive")
    public boolean isRefreshTokenTtlPositive() {
        return refreshTokenTtl != null && !refreshTokenTtl.isNegative() && !refreshTokenTtl.isZero();
    }
}
