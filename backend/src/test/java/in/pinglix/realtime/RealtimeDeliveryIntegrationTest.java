package in.pinglix.realtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.pinglix.auth.RefreshTokenRepository;
import in.pinglix.auth.dto.AuthUserResponse;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.conversation.ConversationRepository;
import in.pinglix.conversation.PrivateConversationRepository;
import in.pinglix.message.MessageRepository;
import in.pinglix.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(RealtimeDeliveryIntegrationTest.SubscriptionTestConfig.class)
class RealtimeDeliveryIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PrivateConversationRepository privateConversationRepository;

    @Autowired
    private ConversationMemberRepository conversationMemberRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionListener subscriptionListener;

    @MockitoSpyBean
    private SimpMessagingTemplate messagingTemplate;

    private WebSocketStompClient stompClient;
    private ThreadPoolTaskScheduler taskScheduler;
    private StompSession session;
    private TestSessionHandler sessionHandler;

    @BeforeEach
    void setUpClient() {
        subscriptionListener.reset();
        taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setPoolSize(1);
        taskScheduler.setThreadNamePrefix("realtime-test-");
        taskScheduler.initialize();

        stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        MappingJackson2MessageConverter messageConverter =
                new MappingJackson2MessageConverter();
        messageConverter.setObjectMapper(objectMapper);
        stompClient.setMessageConverter(messageConverter);
        stompClient.setTaskScheduler(taskScheduler);
        sessionHandler = new TestSessionHandler();
    }

    @AfterEach
    void cleanUp() {
        if (session != null && session.isConnected()) {
            session.disconnect();
        }
        if (stompClient != null) {
            stompClient.stop();
        }
        if (taskScheduler != null) {
            taskScheduler.shutdown();
        }

        messageRepository.deleteAll();
        privateConversationRepository.deleteAll();
        conversationMemberRepository.deleteAll();
        conversationRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void conversationMemberReceivesMessageCreatedAfterRestSend()
            throws Exception {
        RegisteredUser sender = register("sender@example.com", "Sender");
        RegisteredUser receiver = register("receiver@example.com", "Receiver");
        long conversationId = createConversation(sender, receiver.id());
        LinkedBlockingQueue<MessageCreatedEvent> events =
                new LinkedBlockingQueue<>();

        session = connect(receiver.accessCookie());
        session.subscribe(
                "/topic/conversations/" + conversationId,
                eventHandler(events)
        );
        assertThat(subscriptionListener.await()).isTrue();

        ResponseEntity<in.pinglix.message.dto.MessageResponse> response =
                restTemplate.exchange(
                        url("/api/v1/conversations/" + conversationId + "/messages"),
                        HttpMethod.POST,
                        jsonRequest(
                                Map.of(
                                        "clientMessageId",
                                        "b8b19344-9d6f-4f81-b536-3de34a7de1df",
                                        "content",
                                        "Hello in real time"
                                ),
                                sender.accessCookie()
                        ),
                        in.pinglix.message.dto.MessageResponse.class
                );

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        verify(messagingTemplate, timeout(5_000)).convertAndSend(
                eq("/topic/conversations/" + conversationId),
                any(MessageCreatedEvent.class)
        );
        MessageCreatedEvent event = events.poll(5, TimeUnit.SECONDS);
        assertThat(sessionHandler.errors).isEmpty();
        assertThat(event).isNotNull();
        assertThat(event.type()).isEqualTo(RealtimeEventType.MESSAGE_CREATED);
        assertThat(event.conversationId()).isEqualTo(conversationId);
        assertThat(event.message().content()).isEqualTo("Hello in real time");
        assertThat(event.message().sender().id()).isEqualTo(sender.id());
        assertThat(event.message().sender().displayName()).isEqualTo("Sender");
        assertThat(messageRepository.count()).isEqualTo(1);
    }

    private StompSession connect(String accessCookie) throws Exception {
        WebSocketHttpHeaders webSocketHeaders = new WebSocketHttpHeaders();
        webSocketHeaders.setOrigin("http://localhost:5174");
        webSocketHeaders.add(HttpHeaders.COOKIE, accessCookie);
        return stompClient.connectAsync(
                "ws://localhost:" + port + "/ws",
                webSocketHeaders,
                new StompHeaders(),
                sessionHandler
        ).get(5, TimeUnit.SECONDS);
    }

    private StompFrameHandler eventHandler(
            LinkedBlockingQueue<MessageCreatedEvent> events
    ) {
        return new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return MessageCreatedEvent.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                events.offer((MessageCreatedEvent) payload);
            }
        };
    }

    private RegisteredUser register(String email, String displayName) {
        ResponseEntity<AuthUserResponse> response = restTemplate.postForEntity(
                url("/api/v1/auth/register"),
                jsonRequest(
                        Map.of(
                                "email", email,
                                "displayName", displayName,
                                "password", "PinglixPhase7@123"
                        ),
                        null
                ),
                AuthUserResponse.class
        );
        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        return new RegisteredUser(
                response.getBody().id(),
                accessCookie(response.getHeaders())
        );
    }

    private long createConversation(RegisteredUser current, Long targetUserId) {
        ResponseEntity<Map> response = restTemplate.exchange(
                url("/api/v1/conversations/private"),
                HttpMethod.POST,
                jsonRequest(Map.of("targetUserId", targetUserId), current.accessCookie()),
                Map.class
        );
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        Number id = (Number) response.getBody().get("id");
        return id.longValue();
    }

    private HttpEntity<?> jsonRequest(Object body, String accessCookie) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (accessCookie != null) {
            headers.add(HttpHeaders.COOKIE, accessCookie);
        }
        return new HttpEntity<>(body, headers);
    }

    private String accessCookie(HttpHeaders headers) {
        return headers.getOrEmpty(HttpHeaders.SET_COOKIE).stream()
                .map(value -> value.split(";", 2)[0])
                .filter(value -> value.startsWith("pinglix_access="))
                .findFirst()
                .orElseThrow();
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private record RegisteredUser(Long id, String accessCookie) {
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class SubscriptionTestConfig {

        @Bean
        SubscriptionListener subscriptionListener() {
            return new SubscriptionListener();
        }
    }

    static class SubscriptionListener {

        private CountDownLatch latch = new CountDownLatch(1);

        void reset() {
            latch = new CountDownLatch(1);
        }

        @EventListener
        void onSubscribe(SessionSubscribeEvent event) {
            latch.countDown();
        }

        boolean await() throws InterruptedException {
            return latch.await(5, TimeUnit.SECONDS);
        }
    }

    static class TestSessionHandler extends StompSessionHandlerAdapter {

        private final LinkedBlockingQueue<Throwable> errors =
                new LinkedBlockingQueue<>();

        @Override
        public void handleException(
                StompSession session,
                StompCommand command,
                StompHeaders headers,
                byte[] payload,
                Throwable exception
        ) {
            errors.offer(exception);
        }

        @Override
        public void handleTransportError(
                StompSession session,
                Throwable exception
        ) {
            errors.offer(exception);
        }
    }
}
