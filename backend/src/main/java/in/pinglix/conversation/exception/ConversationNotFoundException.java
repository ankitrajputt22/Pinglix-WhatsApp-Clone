package in.pinglix.conversation.exception;

public class ConversationNotFoundException extends RuntimeException {

    public ConversationNotFoundException() {
        super("Conversation not found");
    }
}
