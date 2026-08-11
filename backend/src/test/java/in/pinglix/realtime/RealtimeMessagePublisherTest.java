package in.pinglix.realtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.time.Instant;
import java.util.List;

import in.pinglix.message.MessageStatus;
import in.pinglix.message.MessageType;
import in.pinglix.message.dto.MessageResponse;
import in.pinglix.message.dto.MessageSenderResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class RealtimeMessagePublisherTest {

    private final SimpMessagingTemplate messagingTemplate = mock(
            SimpMessagingTemplate.class
    );
    private final RealtimeMessagePublisher publisher =
            new RealtimeMessagePublisher(messagingTemplate);

    @AfterEach
    void clearTransactionState() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    @Test
    void publishesSafeMessageCreatedEventToConversationTopic() {
        MessageResponse message = messageResponse();

        publisher.publishMessageCreated(message);

        ArgumentCaptor<MessageCreatedEvent> eventCaptor =
                ArgumentCaptor.forClass(MessageCreatedEvent.class);
        verify(messagingTemplate).convertAndSend(
                org.mockito.ArgumentMatchers.eq("/topic/conversations/10"),
                eventCaptor.capture()
        );
        MessageCreatedEvent event = eventCaptor.getValue();
        assertThat(event.type()).isEqualTo(RealtimeEventType.MESSAGE_CREATED);
        assertThat(event.conversationId()).isEqualTo(10L);
        assertThat(event.message()).isEqualTo(message);
        assertThat(event.message().sender().displayName()).isEqualTo("Ankit");
    }

    @Test
    void waitsUntilTransactionCommitBeforePublishing() {
        TransactionSynchronizationManager.setActualTransactionActive(true);
        TransactionSynchronizationManager.initSynchronization();

        publisher.publishMessageCreated(messageResponse());

        verify(messagingTemplate, never()).convertAndSend(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(MessageCreatedEvent.class)
        );
        List<TransactionSynchronization> synchronizations =
                TransactionSynchronizationManager.getSynchronizations();
        assertThat(synchronizations).hasSize(1);

        synchronizations.forEach(TransactionSynchronization::afterCommit);

        verify(messagingTemplate).convertAndSend(
                org.mockito.ArgumentMatchers.eq("/topic/conversations/10"),
                org.mockito.ArgumentMatchers.any(MessageCreatedEvent.class)
        );
    }

    private MessageResponse messageResponse() {
        return new MessageResponse(
                101L,
                "b8b19344-9d6f-4f81-b536-3de34a7de1df",
                10L,
                new MessageSenderResponse(
                        1L,
                        "Ankit",
                        "ankit@example.com",
                        null
                ),
                MessageType.TEXT,
                "Hello",
                MessageStatus.SENT,
                Instant.parse("2026-08-08T00:30:00Z"),
                null,
                null
        );
    }
}
