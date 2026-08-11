package in.pinglix.realtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import in.pinglix.conversation.Conversation;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.AccountStatus;
import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import org.junit.jupiter.api.Test;

class PresenceServiceTest {

    private final ConversationMemberRepository memberRepository = mock(
            ConversationMemberRepository.class
    );
    private final UserRepository userRepository = mock(UserRepository.class);
    private final RealtimeMessagePublisher publisher = mock(
            RealtimeMessagePublisher.class
    );
    private final PresenceService presenceService = new PresenceService(
            memberRepository,
            userRepository,
            publisher
    );

    @Test
    void marksUserOnlineForTheirActiveConversations() {
        Conversation conversation = mock(Conversation.class);
        when(conversation.getId()).thenReturn(10L);
        when(memberRepository.findActiveConversationsByUserId(1L))
                .thenReturn(List.of(conversation));

        presenceService.markConnected("session-1", user(1L));

        assertThat(presenceService.isOnline(1L)).isTrue();
        verify(publisher).publishPresence(
                RealtimeEventType.USER_ONLINE,
                10L,
                1L,
                null
        );
    }

    @Test
    void marksLastSeenAndPublishesOfflineWhenLastSessionDisconnects() {
        User persistedUser = new User(
                "user@example.com",
                "password-hash",
                "User"
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(persistedUser));
        when(memberRepository.findActiveConversationsByUserId(1L))
                .thenReturn(List.of());

        presenceService.markConnected("session-1", user(1L));
        presenceService.markDisconnected("session-1");

        assertThat(presenceService.isOnline(1L)).isFalse();
        assertThat(persistedUser.getLastSeenAt()).isNotNull();
        verify(userRepository).save(persistedUser);
    }

    private CustomUserDetails user(Long id) {
        return new CustomUserDetails(
                id,
                "user" + id + "@example.com",
                "password-hash",
                AccountStatus.ACTIVE,
                null,
                null
        );
    }
}
