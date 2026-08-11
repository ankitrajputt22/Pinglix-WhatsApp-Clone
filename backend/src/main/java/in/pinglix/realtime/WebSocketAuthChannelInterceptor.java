package in.pinglix.realtime;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.security.CustomUserDetails;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Pattern CONVERSATION_TOPIC = Pattern.compile(
            "^/topic/conversations/([1-9][0-9]*)$"
    );
    private static final String USER_MESSAGE_QUEUE = "/user/queue/messages";
    private static final Pattern TYPING_DESTINATION = Pattern.compile(
            "^/app/conversations/([1-9][0-9]*)/typing\\.(start|stop)$"
    );

    private final ConversationMemberRepository conversationMemberRepository;
    private final PresenceService presenceService;

    public WebSocketAuthChannelInterceptor(
            ConversationMemberRepository conversationMemberRepository
    ) {
        this.conversationMemberRepository = conversationMemberRepository;
        this.presenceService = null;
    }

    @Autowired
    public WebSocketAuthChannelInterceptor(
            ConversationMemberRepository conversationMemberRepository,
            PresenceService presenceService
    ) {
        this.conversationMemberRepository = conversationMemberRepository;
        this.presenceService = presenceService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message,
                StompHeaderAccessor.class
        );
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            if (presenceService != null) {
                presenceService.markConnected(
                        accessor.getSessionId(),
                        requireCurrentUser(accessor.getUser())
                );
            } else {
                requireCurrentUser(accessor.getUser());
            }
        }
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscription(accessor);
        }
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            authorizeTypingSend(accessor);
        }
        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            if (presenceService != null) {
                presenceService.markDisconnected(accessor.getSessionId());
            }
        }
        return message;
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        CustomUserDetails currentUser = requireCurrentUser(accessor.getUser());
        String destination = accessor.getDestination();

        if (USER_MESSAGE_QUEUE.equals(destination)) {
            return;
        }

        Matcher matcher = CONVERSATION_TOPIC.matcher(
                destination == null ? "" : destination
        );
        if (!matcher.matches()) {
            throw new AccessDeniedException("Subscription is not allowed");
        }

        Long conversationId;
        try {
            conversationId = Long.valueOf(matcher.group(1));
        } catch (NumberFormatException exception) {
            throw new AccessDeniedException("Subscription is not allowed");
        }

        if (!conversationMemberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(
                        conversationId,
                        currentUser.id()
                )) {
            throw new AccessDeniedException(
                    "You do not have access to this conversation"
            );
        }
        if (presenceService != null) {
            presenceService.publishConversationSnapshot(conversationId);
        }
    }

    private void authorizeTypingSend(StompHeaderAccessor accessor) {
        CustomUserDetails currentUser = requireCurrentUser(accessor.getUser());
        Matcher matcher = TYPING_DESTINATION.matcher(
                accessor.getDestination() == null ? "" : accessor.getDestination()
        );
        if (!matcher.matches()) {
            throw new AccessDeniedException("Message destination is not allowed");
        }
        Long conversationId = Long.valueOf(matcher.group(1));
        if (!conversationMemberRepository
                .existsByConversationIdAndUserIdAndLeftAtIsNull(
                        conversationId,
                        currentUser.id()
                )) {
            throw new AccessDeniedException(
                    "You do not have access to this conversation"
            );
        }
    }

    private CustomUserDetails requireCurrentUser(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails user) {
            return user;
        }
        throw new AccessDeniedException("Authentication is required");
    }
}
