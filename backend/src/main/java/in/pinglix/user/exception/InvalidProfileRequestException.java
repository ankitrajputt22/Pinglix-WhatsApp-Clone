package in.pinglix.user.exception;

public class InvalidProfileRequestException extends RuntimeException {

    public InvalidProfileRequestException(String message) {
        super(message);
    }
}
