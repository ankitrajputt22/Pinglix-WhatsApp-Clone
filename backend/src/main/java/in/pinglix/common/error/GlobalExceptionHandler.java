package in.pinglix.common.error;

import java.time.Instant;

import in.pinglix.auth.exception.AuthenticationRequiredException;
import in.pinglix.auth.exception.DuplicateEmailException;
import in.pinglix.auth.exception.InvalidCredentialsException;
import in.pinglix.conversation.exception.ConversationAccessDeniedException;
import in.pinglix.conversation.exception.ConversationNotFoundException;
import in.pinglix.conversation.exception.InvalidConversationRequestException;
import in.pinglix.message.exception.InvalidMessageRequestException;
import in.pinglix.message.exception.MessageNotFoundException;
import in.pinglix.message.exception.MessageSendFailedException;
import in.pinglix.user.exception.InvalidUserSearchException;
import in.pinglix.user.exception.UserNotFoundException;
import jakarta.validation.ConstraintViolationException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Request validation failed");
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Request body is invalid",
                request
        );
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(
            DuplicateEmailException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                "DUPLICATE_RESOURCE",
                "Email is already registered",
                request
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                "DUPLICATE_RESOURCE",
                "Resource already exists",
                request
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(AuthenticationRequiredException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationRequired(
            AuthenticationRequiredException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.UNAUTHORIZED,
                "AUTHENTICATION_REQUIRED",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(InvalidUserSearchException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidUserSearch(
            InvalidUserSearchException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(
            UserNotFoundException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(ConversationNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleConversationNotFound(
            ConversationNotFoundException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(ConversationAccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleConversationAccessDenied(
            ConversationAccessDeniedException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                "CONVERSATION_ACCESS_DENIED",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(InvalidConversationRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidConversationRequest(
            InvalidConversationRequestException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(InvalidMessageRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidMessageRequest(
            InvalidMessageRequestException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        String message = exception.getConstraintViolations().stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("Request validation failed");
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message, request);
    }

    @ExceptionHandler(MessageNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotFound(
            MessageNotFoundException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(MessageSendFailedException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageSendFailed(
            MessageSendFailedException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.CONFLICT,
                "MESSAGE_SEND_FAILED",
                exception.getMessage(),
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Unexpected error while handling {}", request.getRequestURI(), exception);

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Unexpected server error",
                request
        );
    }

    private ResponseEntity<ApiErrorResponse> error(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                code,
                message,
                request.getRequestURI()
        ));
    }
}
