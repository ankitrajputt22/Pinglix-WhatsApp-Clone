package in.pinglix.message.exception;

public class MessageSendFailedException extends RuntimeException {

    public MessageSendFailedException(String message) {
        super(message);
    }
}
