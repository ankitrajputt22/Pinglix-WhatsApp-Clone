package in.pinglix.realtime;

import java.security.Principal;

import in.pinglix.conversation.ConversationMemberRepository;
import in.pinglix.security.CustomUserDetails;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class TypingController {

    private final ConversationMemberRepository memberRepository;
    private final RealtimeMessagePublisher publisher;

    public TypingController(
            ConversationMemberRepository memberRepository,
            RealtimeMessagePublisher publisher
    ) {
        this.memberRepository = memberRepository;
        this.publisher = publisher;
    }

    @MessageMapping("/conversations/{conversationId}/typing.start")
    public void start(
            @DestinationVariable Long conversationId,
            Principal principal
    ) {
        publish(conversationId, currentUser(principal), true);
    }

    @MessageMapping("/conversations/{conversationId}/typing.stop")
    public void stop(
            @DestinationVariable Long conversationId,
            Principal principal
    ) {
        publish(conversationId, currentUser(principal), false);
    }

    private CustomUserDetails currentUser(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails user) {
            return user;
        }
        throw new AccessDeniedException("Authentication is required");
    }

    private void publish(
            Long conversationId,
            CustomUserDetails principal,
            boolean started
    ) {
        if (principal == null || conversationId == null || conversationId <= 0
                || !memberRepository.existsByConversationIdAndUserIdAndLeftAtIsNull(
                conversationId,
                principal.id()
        )) {
            throw new AccessDeniedException(
                    "You do not have access to this conversation"
            );
        }
        if (started) {
            publisher.publishTypingStarted(conversationId, principal.id());
        } else {
            publisher.publishTypingStopped(conversationId, principal.id());
        }
    }
}
