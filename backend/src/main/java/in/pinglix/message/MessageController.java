package in.pinglix.message;

import in.pinglix.message.dto.MessagePageResponse;
import in.pinglix.message.dto.MessageResponse;
import in.pinglix.message.dto.MessageStatusUpdateRequest;
import in.pinglix.message.dto.MessageStatusUpdateResponse;
import in.pinglix.message.dto.SendMessageRequest;
import in.pinglix.security.CustomUserDetails;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/conversations/{conversationId}/messages")
public class MessageController {

    private final MessageService messageService;
    private final MessageStatusService messageStatusService;

    public MessageController(
            MessageService messageService,
            MessageStatusService messageStatusService
    ) {
        this.messageService = messageService;
        this.messageStatusService = messageStatusService;
    }

    @GetMapping
    public MessagePageResponse getMessages(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable
            @Positive(message = "Conversation ID must be valid")
            Long conversationId,
            @RequestParam(required = false)
            @Positive(message = "Before message ID must be valid")
            Long beforeMessageId,
            @RequestParam(defaultValue = "30")
            @Min(value = 1, message = "Limit must be between 1 and 50")
            @Max(value = 50, message = "Limit must be between 1 and 50")
            Integer limit
    ) {
        return messageService.getMessages(
                principal,
                conversationId,
                beforeMessageId,
                limit
        );
    }

    @PostMapping
    public MessageResponse sendMessage(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable
            @Positive(message = "Conversation ID must be valid")
            Long conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return messageService.sendMessage(principal, conversationId, request);
    }

    @PostMapping("/delivered")
    public MessageStatusUpdateResponse markDelivered(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable @Positive(message = "Conversation ID must be valid")
            Long conversationId,
            @Valid @RequestBody MessageStatusUpdateRequest request
    ) {
        return messageStatusService.markDelivered(principal, conversationId, request);
    }

    @PostMapping("/read")
    public MessageStatusUpdateResponse markRead(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable @Positive(message = "Conversation ID must be valid")
            Long conversationId,
            @Valid @RequestBody MessageStatusUpdateRequest request
    ) {
        return messageStatusService.markRead(principal, conversationId, request);
    }
}
