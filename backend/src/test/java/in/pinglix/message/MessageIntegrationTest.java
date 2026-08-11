package in.pinglix.message;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.pinglix.auth.RefreshTokenRepository;
import in.pinglix.conversation.Conversation;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.conversation.ConversationRepository;
import in.pinglix.conversation.PrivateConversationRepository;
import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import in.pinglix.realtime.RealtimeMessagePublisher;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MessageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageReceiptRepository messageReceiptRepository;

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

    @MockitoBean
    private RealtimeMessagePublisher realtimeMessagePublisher;

    @AfterEach
    void cleanDatabase() {
        messageReceiptRepository.deleteAll();
        messageRepository.deleteAll();
        privateConversationRepository.deleteAll();
        conversationMemberRepository.deleteAll();
        conversationRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void recipientCanMarkDeliveredAndReadAndSenderSeesStatus()
            throws Exception {
        RegisteredUser sender = register("sender@example.com", "Sender");
        RegisteredUser receiver = register("receiver@example.com", "Receiver");
        long conversationId = createConversation(sender, receiver.id());
        long messageId = sendAndReturnId(sender, conversationId, "Status test");

        assertThat(messageReceiptRepository.findByMessageIdAndUserId(
                messageId,
                receiver.id()
        )).isPresent();

        mockMvc.perform(post(
                        "/api/v1/conversations/{id}/messages/delivered",
                        conversationId
                )
                        .cookie(receiver.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messageIds\":[" + messageId + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.updatedCount").value(1));

        mockMvc.perform(post(
                        "/api/v1/conversations/{id}/messages/read",
                        conversationId
                )
                        .cookie(receiver.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messageIds\":[" + messageId + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"))
                .andExpect(jsonPath("$.updatedCount").value(1));

        MessageReceipt receipt = messageReceiptRepository
                .findByMessageIdAndUserId(messageId, receiver.id())
                .orElseThrow();
        assertThat(receipt.getDeliveredAt()).isNotNull();
        assertThat(receipt.getReadAt()).isNotNull();

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages",
                        conversationId
                ).cookie(sender.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("READ"));
        verify(realtimeMessagePublisher).publishMessageDelivered(
                org.mockito.ArgumentMatchers.eq(conversationId),
                org.mockito.ArgumentMatchers.eq(java.util.List.of(messageId)),
                org.mockito.ArgumentMatchers.eq(receiver.id()),
                org.mockito.ArgumentMatchers.any()
        );
        verify(realtimeMessagePublisher).publishMessageRead(
                org.mockito.ArgumentMatchers.eq(conversationId),
                org.mockito.ArgumentMatchers.eq(java.util.List.of(messageId)),
                org.mockito.ArgumentMatchers.eq(receiver.id()),
                org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void anonymousAndNonMemberCannotUpdateMessageStatus() throws Exception {
        RegisteredUser sender = register("sender@example.com", "Sender");
        RegisteredUser receiver = register("receiver@example.com", "Receiver");
        RegisteredUser unrelated = register("unrelated@example.com", "Unrelated");
        long conversationId = createConversation(sender, receiver.id());
        long messageId = sendAndReturnId(sender, conversationId, "Protected");

        mockMvc.perform(post(
                        "/api/v1/conversations/{id}/messages/read",
                        conversationId
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messageIds\":[" + messageId + "]}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post(
                        "/api/v1/conversations/{id}/messages/delivered",
                        conversationId
                )
                        .cookie(unrelated.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messageIds\":[" + messageId + "]}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error")
                        .value("CONVERSATION_ACCESS_DENIED"));
    }

    @Test
    void memberCanSendTrimmedMessageAndConversationMetadataIsUpdated()
            throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());
        String clientMessageId = UUID.randomUUID().toString();

        MvcResult result = mockMvc.perform(sendMessage(
                        conversationId,
                        clientMessageId,
                        "  Hello Pinglix  "
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversationId").value(conversationId))
                .andExpect(jsonPath("$.clientMessageId").value(clientMessageId))
                .andExpect(jsonPath("$.messageType").value("TEXT"))
                .andExpect(jsonPath("$.content").value("Hello Pinglix"))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.sender.id").value(current.id()))
                .andExpect(jsonPath("$.sender.displayName").value("Ankit"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.editedAt").isEmpty())
                .andExpect(jsonPath("$.deletedAt").isEmpty())
                .andExpect(jsonPath("$.sender.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.sender.lockedUntil").doesNotExist())
                .andExpect(jsonPath("$.sender.deletedAt").doesNotExist())
                .andReturn();

        long messageId = responseId(result);
        Message stored = messageRepository.findById(messageId).orElseThrow();
        assertThat(stored.getContent()).isEqualTo("Hello Pinglix");
        assertThat(stored.getConversation().getId()).isEqualTo(conversationId);
        assertThat(stored.getSender().getId()).isEqualTo(current.id());

        Conversation updated = conversationRepository.findById(conversationId)
                .orElseThrow();
        assertThat(updated.getLastMessageId()).isEqualTo(messageId);
        assertThat(updated.getLastMessageAt()).isEqualTo(stored.getCreatedAt());
        verify(realtimeMessagePublisher).publishMessageCreated(argThat(message ->
                message.id().equals(messageId)
                        && message.conversationId().equals(conversationId)
                        && message.sender().id().equals(current.id())
                        && message.sender().displayName().equals("Ankit")
                        && message.content().equals("Hello Pinglix")
        ));
    }

    @Test
    void anonymousUserCannotSendOrLoadMessages() throws Exception {
        mockMvc.perform(sendMessage(1L, UUID.randomUUID().toString(), "Hello"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("AUTHENTICATION_REQUIRED"));

        mockMvc.perform(get("/api/v1/conversations/1/messages"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("AUTHENTICATION_REQUIRED"));
    }

    @Test
    void nonMemberCannotSendOrLoadMessages() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        RegisteredUser unrelated = register("priya@example.com", "Priya");
        long conversationId = createConversation(current, target.getId());

        mockMvc.perform(sendMessage(
                        conversationId,
                        UUID.randomUUID().toString(),
                        "Not allowed"
                ).cookie(unrelated.accessCookie()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error")
                        .value("CONVERSATION_ACCESS_DENIED"));

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages",
                        conversationId
                ).cookie(unrelated.accessCookie()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message")
                        .value("You do not have access to this conversation"));
    }

    @Test
    void missingConversationReturnsResourceNotFound() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");

        mockMvc.perform(sendMessage(
                        999999L,
                        UUID.randomUUID().toString(),
                        "Hello"
                ).cookie(current.accessCookie()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Conversation not found"));

        mockMvc.perform(get("/api/v1/conversations/999999/messages")
                        .cookie(current.accessCookie()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Conversation not found"));
    }

    @Test
    void emptyWhitespaceAndTooLongMessagesAreRejected() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());

        for (String invalidContent : new String[]{"", "   \n\t  "}) {
            mockMvc.perform(sendMessage(
                            conversationId,
                            UUID.randomUUID().toString(),
                            invalidContent
                    ).cookie(current.accessCookie()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.message")
                            .value("Message cannot be empty"));
        }

        mockMvc.perform(sendMessage(
                        conversationId,
                        UUID.randomUUID().toString(),
                        "a".repeat(4001)
                ).cookie(current.accessCookie()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Message must be at most 4000 characters"));

        assertThat(messageRepository.count()).isZero();
    }

    @Test
    void invalidClientMessageIdIsRejected() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());

        mockMvc.perform(sendMessage(conversationId, "not-a-uuid", "Hello")
                        .cookie(current.accessCookie()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("Invalid client message ID"));
    }

    @Test
    void duplicateClientMessageIdReturnsExistingMessage() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());
        String clientMessageId = UUID.randomUUID().toString();

        long firstId = responseId(mockMvc.perform(sendMessage(
                        conversationId,
                        clientMessageId,
                        "First content"
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());
        MvcResult duplicate = mockMvc.perform(sendMessage(
                        conversationId,
                        clientMessageId,
                        "Retry content"
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("First content"))
                .andReturn();

        assertThat(responseId(duplicate)).isEqualTo(firstId);
        assertThat(messageRepository.count()).isEqualTo(1);
        verify(realtimeMessagePublisher, times(1))
                .publishMessageCreated(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void memberLoadsMessagesInChronologicalOrderAndEmptyStateIsSafe()
            throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages",
                        conversationId
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.hasMore").value(false))
                .andExpect(jsonPath("$.nextBeforeMessageId").isEmpty());

        sendAndReturnId(current, conversationId, "First");
        sendAndReturnId(current, conversationId, "Second");
        sendAndReturnId(current, conversationId, "Third");

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages",
                        conversationId
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].content").value("First"))
                .andExpect(jsonPath("$.items[1].content").value("Second"))
                .andExpect(jsonPath("$.items[2].content").value("Third"))
                .andExpect(jsonPath("$.hasMore").value(false));
    }

    @Test
    void cursorPaginationSupportsLimitAndBeforeMessageId() throws Exception {
        RegisteredUser current = register("ankit@example.com", "Ankit");
        User target = saveUser("ankush@example.com", "Ankush");
        long conversationId = createConversation(current, target.getId());
        long firstId = sendAndReturnId(current, conversationId, "One");
        long secondId = sendAndReturnId(current, conversationId, "Two");
        long thirdId = sendAndReturnId(current, conversationId, "Three");
        long fourthId = sendAndReturnId(current, conversationId, "Four");
        long fifthId = sendAndReturnId(current, conversationId, "Five");

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages?limit=2",
                        conversationId
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(fourthId))
                .andExpect(jsonPath("$.items[1].id").value(fifthId))
                .andExpect(jsonPath("$.nextBeforeMessageId").value(fourthId))
                .andExpect(jsonPath("$.hasMore").value(true));

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages?beforeMessageId={before}&limit=2",
                        conversationId,
                        fourthId
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value(secondId))
                .andExpect(jsonPath("$.items[1].id").value(thirdId))
                .andExpect(jsonPath("$.nextBeforeMessageId").value(secondId))
                .andExpect(jsonPath("$.hasMore").value(true));

        mockMvc.perform(get(
                        "/api/v1/conversations/{id}/messages?beforeMessageId={before}&limit=2",
                        conversationId,
                        secondId
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").value(firstId))
                .andExpect(jsonPath("$.nextBeforeMessageId").isEmpty())
                .andExpect(jsonPath("$.hasMore").value(false));
    }

    private long createConversation(RegisteredUser current, Long targetUserId)
            throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/conversations/private")
                        .cookie(current.accessCookie())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("targetUserId", targetUserId)
                        )))
                .andExpect(status().isOk())
                .andReturn();
        return responseId(result);
    }

    private long sendAndReturnId(
            RegisteredUser current,
            long conversationId,
            String content
    ) throws Exception {
        return responseId(mockMvc.perform(sendMessage(
                        conversationId,
                        UUID.randomUUID().toString(),
                        content
                ).cookie(current.accessCookie()))
                .andExpect(status().isOk())
                .andReturn());
    }

    private MockHttpServletRequestBuilder sendMessage(
            Long conversationId,
            String clientMessageId,
            String content
    ) throws Exception {
        return post(
                "/api/v1/conversations/{id}/messages",
                conversationId
        )
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "clientMessageId", clientMessageId,
                        "content", content
                )));
    }

    private RegisteredUser register(String email, String displayName) throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "displayName", displayName,
                                "password", "StrongPassword123!"
                        ))))
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
