package in.pinglix.realtime;

import in.pinglix.message.dto.MessageResponse;

public record MessageCreatedEvent(
        RealtimeEventType type,
        Long conversationId,
        MessageResponse message
) {
    public static MessageCreatedEvent from(MessageResponse message) {
        return new MessageCreatedEvent(
                RealtimeEventType.MESSAGE_CREATED,
                message.conversationId(),
                message
        );
    }
}
