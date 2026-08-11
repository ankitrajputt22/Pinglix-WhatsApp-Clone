package in.pinglix.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.stream.IntStream;

import in.pinglix.auth.RefreshTokenRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @AfterEach
    void cleanDatabase() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void returnsCurrentUserProfileWhenAuthenticated() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(get("/api/v1/users/me").cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ankit@example.com"))
                .andExpect(jsonPath("$.displayName").value("Ankit"))
                .andExpect(jsonPath("$.about")
                        .value("Hey there! I am using Pinglix."))
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.lockedUntil").doesNotExist())
                .andExpect(jsonPath("$.deletedAt").doesNotExist())
                .andExpect(jsonPath("$.tokenHash").doesNotExist());
    }

    @Test
    void rejectsCurrentUserProfileWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void authenticatedUserCanUpdateOwnProfile() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(patch("/api/v1/users/me")
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "Ankit Updated",
                                  "about": "Building Pinglix",
                                  "profileImageUrl": "https://example.com/avatar.png"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Ankit Updated"))
                .andExpect(jsonPath("$.about").value("Building Pinglix"))
                .andExpect(jsonPath("$.profileImageUrl")
                        .value("https://example.com/avatar.png"))
                .andExpect(jsonPath("$.email").value("ankit@example.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rejectsProfileUpdateWithoutAuthentication() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Someone\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void rejectsInvalidProfileInput() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(patch("/api/v1/users/me")
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "displayName": "A",
                                  "about": "About",
                                  "profileImageUrl": "not-a-url"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void rejectsOtherUserEndpointsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/search").param("query", "ank"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));

        mockMvc.perform(get("/api/v1/users/{id}", 1))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void searchesUsersCaseInsensitivelyByNameOrEmail() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User ankush = saveUser("ankush@example.com", "Ankush");
        User priya = saveUser("priya@example.com", "Priya");

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "ANk")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(ankush.getId()))
                .andExpect(jsonPath("$[0].email").value("ankush@example.com"));

        assertThat(priya.getId()).isNotNull();
    }

    @Test
    void rejectsSearchQueryShorterThanTwoTrimmedCharacters() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", " a ")
                        .cookie(accessCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("Search query must be at least 2 characters"));
    }

    @Test
    void rejectsSearchQueryLongerThanOneHundredCharacters() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "a".repeat(101))
                        .cookie(accessCookie))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("Search query must be at most 100 characters"));
    }

    @Test
    void trimsSearchQueryBeforeMatching() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User target = saveUser("trimmed@example.com", "Trimmed Match");

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "  trimmed  ")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(target.getId()));
    }

    @Test
    void excludesCurrentUserFromSearchResults() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "ankit")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void excludesDeletedUsersFromSearchResults() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User deleted = saveUser("deleted@example.com", "Deleted User");
        deleted.markDeleted(Instant.now());
        userRepository.save(deleted);

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "deleted")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void excludesDisabledAndLockedUsersFromSearchResults() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User disabled = saveUser("disabled@example.com", "Unavailable Disabled");
        disabled.changeAccountStatus(AccountStatus.DISABLED);
        User locked = saveUser("locked@example.com", "Unavailable Locked");
        locked.changeAccountStatus(AccountStatus.LOCKED);
        userRepository.saveAll(List.of(disabled, locked));

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "unavailable")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void limitsSearchResultsToTwentyUsers() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        IntStream.range(0, 25).forEach(index -> saveUser(
                "person%02d@example.com".formatted(index),
                "Person %02d".formatted(index)
        ));

        mockMvc.perform(get("/api/v1/users/search")
                        .param("query", "person")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(20));
    }

    @Test
    void returnsSafePublicUserById() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User target = saveUser("ankush@example.com", "Ankush");

        mockMvc.perform(get("/api/v1/users/{id}", target.getId())
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(target.getId()))
                .andExpect(jsonPath("$.displayName").value("Ankush"))
                .andExpect(jsonPath("$.about").isNotEmpty());
    }

    @Test
    void returnsResourceNotFoundForMissingUser() throws Exception {
        Cookie accessCookie = registerCurrentUser();

        mockMvc.perform(get("/api/v1/users/{id}", 999999)
                        .cookie(accessCookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @ParameterizedTest
    @EnumSource(
            value = AccountStatus.class,
            names = {"LOCKED", "DISABLED", "DELETED"}
    )
    void returnsResourceNotFoundForUnavailableUser(
            AccountStatus accountStatus
    ) throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User target = saveUser(
                accountStatus.name().toLowerCase() + "@example.com",
                "Unavailable User"
        );
        target.changeAccountStatus(accountStatus);
        userRepository.save(target);

        mockMvc.perform(get("/api/v1/users/{id}", target.getId())
                        .cookie(accessCookie))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    void neverIncludesSensitiveFieldsInUserResponses() throws Exception {
        Cookie accessCookie = registerCurrentUser();
        User target = saveUser("safe@example.com", "Safe User");

        mockMvc.perform(get("/api/v1/users/{id}", target.getId())
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password_hash").doesNotExist())
                .andExpect(jsonPath("$.lockedUntil").doesNotExist())
                .andExpect(jsonPath("$.deletedAt").doesNotExist())
                .andExpect(jsonPath("$.tokenHash").doesNotExist())
                .andExpect(jsonPath("$.refreshTokens").doesNotExist());
    }

    private Cookie registerCurrentUser() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "ankit@example.com",
                                  "displayName": "Ankit",
                                  "password": "StrongPassword123!"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        return cookie(registration, "pinglix_access");
    }

    private User saveUser(String email, String displayName) {
        return userRepository.save(new User(email, "unused-password-hash", displayName));
    }

    private Cookie cookie(MvcResult result, String name) {
        String prefix = name + "=";
        String header = result.getResponse()
                .getHeaders(HttpHeaders.SET_COOKIE)
                .stream()
                .filter(value -> value.startsWith(prefix))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing cookie " + name));
        String value = header.substring(prefix.length(), header.indexOf(';'));
        return new Cookie(name, value);
    }
}
