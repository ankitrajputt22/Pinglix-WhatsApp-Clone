package in.pinglix.realtime;

import java.time.Instant;
import java.util.List;

public record MessageReadEvent(
        RealtimeEventType type,
        Long conversationId,
        List<Long> messageIds,
        Long userId,
        Instant readAt
) {
    public MessageReadEvent(
            Long conversationId,
            List<Long> messageIds,
            Long userId,
            Instant readAt
    ) {
        this(
                RealtimeEventType.MESSAGE_READ,
                conversationId,
                List.copyOf(messageIds),
                userId,
                readAt
        );
    }
}
