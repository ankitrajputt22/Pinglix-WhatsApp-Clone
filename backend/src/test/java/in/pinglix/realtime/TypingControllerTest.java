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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

class TypingControllerTest {

    private final ConversationMemberRepository memberRepository = mock(
            ConversationMemberRepository.class
    );
    private final RealtimeMessagePublisher publisher = mock(
            RealtimeMessagePublisher.class
    );
    private final TypingController controller = new TypingController(
            memberRepository,
            publisher
    );

    @Test
    void memberCanPublishTypingEvents() {
        when(memberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(10L, 1L))
                .thenReturn(true);

        controller.start(10L, authentication(1L));
        controller.stop(10L, authentication(1L));

        verify(publisher).publishTypingStarted(10L, 1L);
        verify(publisher).publishTypingStopped(10L, 1L);
    }

    @Test
    void nonMemberCannotPublishTypingEvents() {
        when(memberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(10L, 1L))
                .thenReturn(false);

        assertThatThrownBy(() -> controller.start(10L, authentication(1L)))
                .isInstanceOf(AccessDeniedException.class);
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
