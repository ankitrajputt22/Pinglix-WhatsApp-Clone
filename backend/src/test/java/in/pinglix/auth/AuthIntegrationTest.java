package in.pinglix.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    private static final String EMAIL = "ankit@example.com";
    private static final String PASSWORD = "StrongPassword123!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void cleanDatabase() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registersUserAndSetsHttpOnlyAuthenticationCookies() throws Exception {
        MvcResult registration = mockMvc.perform(registerRequest())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.displayName").value("Ankit"))
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"))
                .andExpect(header().stringValues(
                        HttpHeaders.SET_COOKIE,
                        org.hamcrest.Matchers.everyItem(
                                org.hamcrest.Matchers.containsString("HttpOnly")
                        )
                ))
                .andReturn();

        assertThat(userRepository.findByEmailIgnoreCase(EMAIL)).isPresent();
        assertThat(refreshTokenRepository.count()).isEqualTo(1);
        assertThat(registration.getResponse().getHeaders(HttpHeaders.SET_COOKIE))
                .hasSize(2)
                .allMatch(value -> value.contains("SameSite=Lax"));
    }

    @Test
    void rejectsDuplicateEmail() throws Exception {
        mockMvc.perform(registerRequest()).andExpect(status().isCreated());

        mockMvc.perform(registerRequest())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE_RESOURCE"))
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void rejectsInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "invalid",
                                  "displayName": "Ankit",
                                  "password": "StrongPassword123!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Enter a valid email address"));
    }

    @Test
    void rejectsWeakPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "ankit@example.com",
                                  "displayName": "Ankit",
                                  "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Password must be at least 8 characters"));
    }

    @Test
    void logsInWithCorrectCredentials() throws Exception {
        createUser();

        mockMvc.perform(loginRequest(PASSWORD))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    void rejectsWrongPasswordWithoutRevealingCredentialDetails() throws Exception {
        createUser();

        mockMvc.perform(loginRequest("WrongPassword123!"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void returnsCurrentUserWithValidAccessCookie() throws Exception {
        MvcResult registration = mockMvc.perform(registerRequest())
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(cookie(registration, "pinglix_access")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rejectsCurrentUserRequestWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void logoutRevokesRefreshTokenAndClearsCookies() throws Exception {
        MvcResult registration = mockMvc.perform(registerRequest())
                .andExpect(status().isCreated())
                .andReturn();
        Cookie accessCookie = cookie(registration, "pinglix_access");
        Cookie refreshCookie = cookie(registration, "pinglix_refresh");

        MvcResult logout = mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(accessCookie, refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andReturn();

        assertThat(logout.getResponse().getHeaders(HttpHeaders.SET_COOKIE))
                .allMatch(value -> value.contains("Max-Age=0"));
        assertThat(refreshTokenRepository.findByTokenHash(hash(refreshCookie.getValue())))
                .get()
                .extracting(RefreshToken::getRevokedAt)
                .isNotNull();
    }

    @Test
    void refreshRotatesTokenAndIssuesNewCookies() throws Exception {
        MvcResult registration = mockMvc.perform(registerRequest())
                .andExpect(status().isCreated())
                .andReturn();
        Cookie originalRefresh = cookie(registration, "pinglix_refresh");

        MvcResult refreshed = mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(originalRefresh))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andReturn();

        Cookie replacementRefresh = cookie(refreshed, "pinglix_refresh");
        assertThat(replacementRefresh.getValue()).isNotEqualTo(originalRefresh.getValue());
        assertThat(refreshTokenRepository.findByTokenHash(hash(originalRefresh.getValue())))
                .get()
                .extracting(RefreshToken::getRevokedAt)
                .isNotNull();
        assertThat(refreshTokenRepository.findByTokenHash(hash(replacementRefresh.getValue())))
                .isPresent();
    }

    @Test
    void revokedRefreshTokenCannotBeReused() throws Exception {
        MvcResult registration = mockMvc.perform(registerRequest())
                .andExpect(status().isCreated())
                .andReturn();
        Cookie originalRefresh = cookie(registration, "pinglix_refresh");

        mockMvc.perform(post("/api/v1/auth/refresh").cookie(originalRefresh))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/refresh").cookie(originalRefresh))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void storesPasswordAsBcryptHashInsteadOfPlainText() throws Exception {
        mockMvc.perform(registerRequest()).andExpect(status().isCreated());

        User user = userRepository.findByEmailIgnoreCase(EMAIL).orElseThrow();
        assertThat(user.getPasswordHash())
                .startsWith("$2")
                .isNotEqualTo(PASSWORD);
        assertThat(passwordEncoder.matches(PASSWORD, user.getPasswordHash())).isTrue();
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
    registerRequest() {
        return post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "ankit@example.com",
                          "displayName": "Ankit",
                          "password": "StrongPassword123!"
                        }
                        """);
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
    loginRequest(String password) {
        return post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "%s",
                          "password": "%s"
                        }
                        """.formatted(EMAIL, password));
    }

    private void createUser() {
        userRepository.save(new User(
                EMAIL,
                passwordEncoder.encode(PASSWORD),
                "Ankit"
        ));
    }

    private Cookie cookie(MvcResult result, String name) {
        List<String> setCookieHeaders =
                result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        String prefix = name + "=";
        String header = setCookieHeaders.stream()
                .filter(value -> value.startsWith(prefix))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing cookie " + name));
        String value = header.substring(prefix.length(), header.indexOf(';'));
        return new Cookie(name, value);
    }

    private String hash(String token) throws Exception {
        return HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256")
                        .digest(token.getBytes(StandardCharsets.UTF_8))
        );
    }
}
