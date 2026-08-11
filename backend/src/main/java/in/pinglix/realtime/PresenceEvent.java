package in.pinglix.realtime;

import java.time.Instant;

public record PresenceEvent(
        RealtimeEventType type,
        Long conversationId,
        Long userId,
        Instant lastSeenAt
) {
    public PresenceEvent(
            RealtimeEventType type,
            Long conversationId,
            Long userId,
            Instant lastSeenAt
    ) {
        this.type = type;
        this.conversationId = conversationId;
        this.userId = userId;
        this.lastSeenAt = lastSeenAt;
        if (type != RealtimeEventType.USER_ONLINE
                && type != RealtimeEventType.USER_OFFLINE) {
            throw new IllegalArgumentException("Invalid presence event type");
        }
    }
}
