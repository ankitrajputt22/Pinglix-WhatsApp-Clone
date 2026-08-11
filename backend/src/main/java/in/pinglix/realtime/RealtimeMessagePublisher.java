package in.pinglix.realtime;

import java.time.Instant;
import java.util.List;

import in.pinglix.message.dto.MessageResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
public class RealtimeMessagePublisher {

    static final String CONVERSATION_TOPIC_PREFIX = "/topic/conversations/";

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeMessagePublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishMessageCreated(MessageResponse message) {
        MessageCreatedEvent event = MessageCreatedEvent.from(message);
        Runnable publish = () -> messagingTemplate.convertAndSend(
                destination(event.conversationId()),
                event
        );

        if (TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            publish.run();
                        }
                    }
            );
            return;
        }

        publish.run();
    }

    public void publishMessageDelivered(
            Long conversationId,
            List<Long> messageIds,
            Long userId,
            Instant deliveredAt
    ) {
        MessageDeliveredEvent event = new MessageDeliveredEvent(
                conversationId,
                messageIds,
                userId,
                deliveredAt
        );
        publishAfterCommit(conversationId, event);
    }

    public void publishMessageRead(
            Long conversationId,
            List<Long> messageIds,
            Long userId,
            Instant readAt
    ) {
        MessageReadEvent event = new MessageReadEvent(
                conversationId,
                messageIds,
                userId,
                readAt
        );
        publishAfterCommit(conversationId, event);
    }

    public void publishTypingStarted(Long conversationId, Long userId) {
        publishNow(conversationId, new TypingEvent(
                RealtimeEventType.TYPING_STARTED,
                conversationId,
                userId
        ));
    }

    public void publishTypingStopped(Long conversationId, Long userId) {
        publishNow(conversationId, new TypingEvent(
                RealtimeEventType.TYPING_STOPPED,
                conversationId,
                userId
        ));
    }

    public void publishPresence(
            RealtimeEventType type,
            Long conversationId,
            Long userId,
            Instant lastSeenAt
    ) {
        publishNow(conversationId, new PresenceEvent(
                type,
                conversationId,
                userId,
                lastSeenAt
        ));
    }

    private void publishNow(Long conversationId, Object event) {
        messagingTemplate.convertAndSend(destination(conversationId), event);
    }

    private void publishAfterCommit(Long conversationId, Object event) {
        Runnable publish = () -> messagingTemplate.convertAndSend(
                destination(conversationId),
                event
        );

        if (TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            publish.run();
                        }
                    }
            );
            return;
        }

        publish.run();
    }

    static String destination(Long conversationId) {
        return CONVERSATION_TOPIC_PREFIX + conversationId;
    }
}
