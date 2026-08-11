package in.pinglix.conversation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreatePrivateConversationRequest(
        @NotNull(message = "Target user is required")
        @Positive(message = "Target user must be valid")
        Long targetUserId
) {
}
