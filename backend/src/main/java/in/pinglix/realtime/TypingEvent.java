package in.pinglix.realtime;

public record TypingEvent(
        RealtimeEventType type,
        Long conversationId,
        Long userId
) {
    public TypingEvent(
            RealtimeEventType type,
            Long conversationId,
            Long userId
    ) {
        this.type = type;
        this.conversationId = conversationId;
        this.userId = userId;
        if (type != RealtimeEventType.TYPING_STARTED
                && type != RealtimeEventType.TYPING_STOPPED) {
            throw new IllegalArgumentException("Invalid typing event type");
        }
    }
}
