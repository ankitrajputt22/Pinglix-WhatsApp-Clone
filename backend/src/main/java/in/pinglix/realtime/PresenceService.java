package in.pinglix.realtime;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import in.pinglix.conversation.Conversation;
import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.security.CustomUserDetails;
import in.pinglix.user.User;
import in.pinglix.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PresenceService {

    private final Map<String, Long> sessions = new ConcurrentHashMap<>();
    private final Map<Long, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final ConversationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final RealtimeMessagePublisher publisher;

    public PresenceService(
            ConversationMemberRepository memberRepository,
            UserRepository userRepository,
            @Lazy RealtimeMessagePublisher publisher
    ) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.publisher = publisher;
    }

    @Transactional
    public void markConnected(String sessionId, CustomUserDetails user) {
        if (sessionId == null || user == null || sessions.putIfAbsent(
                sessionId,
                user.id()
        ) != null) {
            return;
        }

        Set<String> activeSessions = userSessions.computeIfAbsent(
                user.id(),
                ignored -> ConcurrentHashMap.newKeySet()
        );
        boolean wasOffline = activeSessions.isEmpty();
        activeSessions.add(sessionId);
        if (wasOffline) {
            broadcastForUser(user.id(), RealtimeEventType.USER_ONLINE, null);
        }
    }

    @Transactional
    public void markDisconnected(String sessionId) {
        if (sessionId == null) {
            return;
        }
        Long userId = sessions.remove(sessionId);
        if (userId == null) {
            return;
        }

        Set<String> activeSessions = userSessions.get(userId);
        if (activeSessions == null) {
            return;
        }
        activeSessions.remove(sessionId);
        if (!activeSessions.isEmpty()) {
            return;
        }
        userSessions.remove(userId, activeSessions);

        Instant lastSeenAt = Instant.now();
        userRepository.findById(userId).ifPresent(user -> {
            user.recordLastSeen(lastSeenAt);
            userRepository.save(user);
        });
        broadcastForUser(userId, RealtimeEventType.USER_OFFLINE, lastSeenAt);
    }

    public boolean isOnline(Long userId) {
        Set<String> activeSessions = userSessions.get(userId);
        return activeSessions != null && !activeSessions.isEmpty();
    }

    @Transactional(readOnly = true)
    public void publishConversationSnapshot(Long conversationId) {
        memberRepository.findByConversationIdAndLeftAtIsNull(conversationId)
                .stream()
                .map(member -> member.getUser().getId())
                .filter(this::isOnline)
                .forEach(userId -> publisher.publishPresence(
                        RealtimeEventType.USER_ONLINE,
                        conversationId,
                        userId,
                        null
                ));
    }

    @Transactional(readOnly = true)
    private void broadcastForUser(
            Long userId,
            RealtimeEventType type,
            Instant lastSeenAt
    ) {
        memberRepository.findActiveConversationsByUserId(userId)
                .stream()
                .map(Conversation::getId)
                .forEach(conversationId -> publisher.publishPresence(
                        type,
                        conversationId,
                        userId,
                        lastSeenAt
                ));
    }
}
