package in.pinglix.conversation.exception;

public class ConversationAccessDeniedException extends RuntimeException {

    public ConversationAccessDeniedException() {
        super("You do not have access to this conversation");
    }
}
