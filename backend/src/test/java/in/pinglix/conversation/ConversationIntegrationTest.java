package in.pinglix.conversation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.pinglix.auth.RefreshTokenRepository;
import in.pinglix.user.AccountStatus;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConversationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository conversationMemberRepository;

    @Autowired
    private PrivateConversationRepository privateConversationRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanDatabase() {
        privateConversationRepository.deleteAll();
        conversationMemberRepository.deleteAll();
        conversationRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authenticatedUserCanCreatePrivateConversationWithSafeResponse()
            throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");

        mockMvc.perform(createPrivateConversation(target.getId())
                        .cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversationType").value("PRIVATE"))
                .andExpect(jsonPath("$.title").isEmpty())
                .andExpect(jsonPath("$.imageUrl").isEmpty())
                .andExpect(jsonPath("$.otherParticipant.id").value(target.getId()))
                .andExpect(jsonPath("$.otherParticipant.email")
                        .value("ankush@example.com"))
                .andExpect(jsonPath("$.otherParticipant.displayName")
                        .value("Ankush"))
                .andExpect(jsonPath("$.otherParticipant.profileImageUrl").isEmpty())
                .andExpect(jsonPath("$.otherParticipant.about")
                        .value("Hey there! I am using Pinglix."))
                .andExpect(jsonPath("$.lastMessageAt").isEmpty())
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.updatedAt").isNotEmpty())
                .andExpect(jsonPath("$.otherParticipant.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.otherParticipant.lockedUntil").doesNotExist())
                .andExpect(jsonPath("$.otherParticipant.deletedAt").doesNotExist());
    }

    @Test
    void anonymousUserCannotCreateListOrViewConversations() throws Exception {
        mockMvc.perform(post("/api/v1/conversations/private")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetUserId\": 2}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));

        mockMvc.perform(get("/api/v1/conversations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));

        mockMvc.perform(get("/api/v1/conversations/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void userCannotCreateConversationWithSelf() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");

        mockMvc.perform(createPrivateConversation(current.id())
                        .cookie(current.accessCookie()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("You cannot start a conversation with yourself"));
    }

    @Test
    void missingTargetUserReturnsResourceNotFound() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");

        mockMvc.perform(createPrivateConversation(999999L)
                        .cookie(current.accessCookie()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    void nullTargetUserReturnsRequiredValidationMessage() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");

        mockMvc.perform(post("/api/v1/conversations/private")
                        .cookie(current.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Target user is required"));
    }

    @Test
    void unavailableTargetUsersCannotStartConversations() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User disabled = saveUser("disabled@example.com", "Disabled");
        disabled.changeAccountStatus(AccountStatus.DISABLED);
        userRepository.save(disabled);
        User locked = saveUser("locked@example.com", "Locked");
        locked.changeAccountStatus(AccountStatus.LOCKED);
        userRepository.save(locked);
        User deleted = saveUser("deleted@example.com", "Deleted");
        deleted.markDeleted(Instant.now());
        userRepository.save(deleted);

        for (User unavailable : List.of(disabled, locked, deleted)) {
            mockMvc.perform(createPrivateConversation(unavailable.getId())
                            .cookie(current.accessCookie()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value("User not found"));
        }

        assertThat(conversationRepository.count()).isZero();
    }

    @Test
    void reverseDuplicateRequestReturnsExistingConversationAndCreatesOnePair()
            throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        RegisteredUser target = register("ankush@example.com", "Ankush");

        long firstId = responseId(mockMvc.perform(
                        createPrivateConversation(target.id())
                                .cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());
        long secondId = responseId(mockMvc.perform(
                        createPrivateConversation(current.id())
                                .cookie(target.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(secondId).isEqualTo(firstId);
        assertThat(conversationRepository.count()).isEqualTo(1);
        assertThat(privateConversationRepository.count()).isEqualTo(1);
        assertThat(conversationMemberRepository.count()).isEqualTo(2);
        assertThat(conversationMemberRepository
                .countByConversationIdAndLeftAtIsNull(firstId)).isEqualTo(2);
    }

    @Test
    void privatePairStoresSmallerIdFirstAndLargerIdSecond() throws Exception {
        User lowerId = saveUser("lower@example.com", "Lower");
        RegisteredUser higherId = register("higher@example.com", "Higher");

        long conversationId = responseId(mockMvc.perform(
                        createPrivateConversation(lowerId.getId())
                                .cookie(higherId.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());

        PrivateConversation mapping = privateConversationRepository
                .findByConversationId(conversationId)
                .orElseThrow();
        assertThat(mapping.getUserOne().getId()).isEqualTo(lowerId.getId());
        assertThat(mapping.getUserTwo().getId()).isEqualTo(higherId.id());
        assertThat(mapping.getUserOne().getId())
                .isLessThan(mapping.getUserTwo().getId());
    }

    @Test
    void authenticatedUserListsOnlyTheirConversations() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        RegisteredUser unrelated = register("priya@example.com", "Priya");

        mockMvc.perform(createPrivateConversation(target.getId())
                        .cookie(current.accessCookie()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/conversations")
                        .cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].otherParticipant.id").value(target.getId()));

        mockMvc.perform(get("/api/v1/conversations")
                        .cookie(unrelated.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void memberCanViewConversationButNonMemberIsDenied() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        RegisteredUser unrelated = register("priya@example.com", "Priya");
        long conversationId = responseId(mockMvc.perform(
                        createPrivateConversation(target.getId())
                                .cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());

        mockMvc.perform(get("/api/v1/conversations/{id}", conversationId)
                        .cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(conversationId))
                .andExpect(jsonPath("$.otherParticipant.displayName")
                        .value("Ankush"));

        mockMvc.perform(get("/api/v1/conversations/{id}", conversationId)
                        .cookie(unrelated.accessCookie()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error")
                        .value("CONVERSATION_ACCESS_DENIED"))
                .andExpect(jsonPath("$.message")
                        .value("You do not have access to this conversation"));
    }

    @Test
    void missingConversationReturnsResourceNotFound() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");

        mockMvc.perform(get("/api/v1/conversations/999999")
                        .cookie(current.accessCookie()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Conversation not found"));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
    createPrivateConversation(Long targetUserId) {
        return post("/api/v1/conversations/private")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"targetUserId\": %d}".formatted(targetUserId));
    }

    private RegisteredUser register(String email, String displayName) throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "displayName": "%s",
                                  "password": "StrongPassword123!"
                                }
                                """.formatted(email, displayName)))
                .andExpect(status().isCreated())
                .andReturn();
        Long id = userRepository.findByEmailIgnoreCase(email).orElseThrow().getId();
        return new RegisteredUser(id, cookie(registration, "pinglix_access"));
    }

    private User saveUser(String email, String displayName) {
        return userRepository.save(
                new User(email, "unused-password-hash", displayName)
        );
    }

    private long responseId(MvcResult result) throws Exception {
        JsonNode response = objectMapper.readTree(
                result.getResponse().getContentAsString()
        );
        return response.get("id").asLong();
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

    private record RegisteredUser(Long id, Cookie accessCookie) {
    }
}
