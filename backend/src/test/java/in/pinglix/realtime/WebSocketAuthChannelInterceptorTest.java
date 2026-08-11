package in.pinglix.realtime;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.AccountStatus;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

class WebSocketAuthChannelInterceptorTest {

    private final ConversationMemberRepository memberRepository =
            mock(ConversationMemberRepository.class);
    private final WebSocketAuthChannelInterceptor interceptor =
            new WebSocketAuthChannelInterceptor(memberRepository);
    private final MessageChannel channel = mock(MessageChannel.class);

    @Test
    void memberCanSubscribeToConversationTopic() {
        when(memberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(10L, 1L))
                .thenReturn(true);
        Message<byte[]> message = subscribeMessage(
                "/topic/conversations/10",
                authentication(1L)
        );

        interceptor.preSend(message, channel);

        verify(memberRepository)
                .existsByConversationIdAndUserIdAndLeftAtIsNull(10L, 1L);
    }

    @Test
    void nonMemberCannotSubscribeToConversationTopic() {
        when(memberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(10L, 3L))
                .thenReturn(false);
        Message<byte[]> message = subscribeMessage(
                "/topic/conversations/10",
                authentication(3L)
        );

        assertThatThrownBy(() -> interceptor.preSend(message, channel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You do not have access to this conversation");
    }

    @Test
    void anonymousAndUnsupportedSubscriptionsAreRejected() {
        assertThatThrownBy(() -> interceptor.preSend(
                connectMessage(null),
                channel
        )).isInstanceOf(AccessDeniedException.class)
                .hasMessage("Authentication is required");

        assertThatThrownBy(() -> interceptor.preSend(
                subscribeMessage("/topic/unknown", authentication(1L)),
                channel
        )).isInstanceOf(AccessDeniedException.class)
                .hasMessage("Subscription is not allowed");
    }

    private Message<byte[]> subscribeMessage(
            String destination,
            UsernamePasswordAuthenticationToken authentication
    ) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(
                StompCommand.SUBSCRIBE
        );
        accessor.setDestination(destination);
        accessor.setSubscriptionId("subscription-1");
        accessor.setUser(authentication);
        return MessageBuilder.createMessage(
                new byte[0],
                accessor.getMessageHeaders()
        );
    }

    private Message<byte[]> connectMessage(
            UsernamePasswordAuthenticationToken authentication
    ) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(
                StompCommand.CONNECT
        );
        accessor.setUser(authentication);
        return MessageBuilder.createMessage(
                new byte[0],
                accessor.getMessageHeaders()
        );
    }

    private UsernamePasswordAuthenticationToken authentication(Long userId) {
        CustomUserDetails user = new CustomUserDetails(
                userId,
                "user" + userId + "@example.com",
                "password-hash",
                AccountStatus.ACTIVE,
                null,
                null
        );
        return UsernamePasswordAuthenticationToken.authenticated(
                user,
                null,
                List.of()
        );
    }
}
