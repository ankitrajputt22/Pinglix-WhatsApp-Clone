package in.pinglix.realtime;

import java.time.Instant;
import java.util.List;

public record MessageDeliveredEvent(
        RealtimeEventType type,
        Long conversationId,
        List<Long> messageIds,
        Long userId,
        Instant deliveredAt
) {
    public MessageDeliveredEvent(
            Long conversationId,
            List<Long> messageIds,
            Long userId,
            Instant deliveredAt
    ) {
        this(
                RealtimeEventType.MESSAGE_DELIVERED,
                conversationId,
                List.copyOf(messageIds),
                userId,
                deliveredAt
        );
    }
}
