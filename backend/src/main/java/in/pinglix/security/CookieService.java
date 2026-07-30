package in.pinglix.security;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    private final SecurityProperties properties;

    public CookieService(SecurityProperties properties) {
        this.properties = properties;
    }

    public Optional<String> readAccessToken(HttpServletRequest request) {
        return readCookie(request, properties.accessCookieName());
    }

    public Optional<String> readRefreshToken(HttpServletRequest request) {
        return readCookie(request, properties.refreshCookieName());
    }

    public void writeAuthenticationCookies(
            HttpServletResponse response,
            String accessToken,
            String refreshToken
    ) {
        addCookie(
                response,
                properties.accessCookieName(),
                accessToken,
                properties.accessTokenTtl()
        );
        addCookie(
                response,
                properties.refreshCookieName(),
                refreshToken,
                properties.refreshTokenTtl()
        );
    }

    public void clearAuthenticationCookies(HttpServletResponse response) {
        addCookie(response, properties.accessCookieName(), "", Duration.ZERO);
        addCookie(response, properties.refreshCookieName(), "", Duration.ZERO);
    }

    private Optional<String> readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst();
    }

    private void addCookie(
            HttpServletResponse response,
            String name,
            String value,
            Duration maxAge
    ) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(properties.secureCookie())
                .sameSite(properties.sameSite())
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
