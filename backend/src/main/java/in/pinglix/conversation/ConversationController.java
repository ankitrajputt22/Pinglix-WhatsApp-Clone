package in.pinglix.conversation;

import java.util.List;

import in.pinglix.conversation.dto.ConversationResponse;
import in.pinglix.conversation.dto.CreatePrivateConversationRequest;
import in.pinglix.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping
    public List<ConversationResponse> getConversations(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        return conversationService.getConversations(principal);
    }

    @PostMapping("/private")
    public ConversationResponse createPrivateConversation(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CreatePrivateConversationRequest request
    ) {
        return conversationService.createPrivateConversation(principal, request);
    }

    @GetMapping("/{conversationId}")
    public ConversationResponse getConversation(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long conversationId
    ) {
        return conversationService.getConversation(principal, conversationId);
    }
}
