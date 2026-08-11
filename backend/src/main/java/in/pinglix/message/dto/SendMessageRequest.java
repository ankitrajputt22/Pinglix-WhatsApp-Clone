package in.pinglix.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SendMessageRequest(
        @NotBlank(message = "Invalid client message ID")
        @Pattern(
                regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                message = "Invalid client message ID"
        )
        String clientMessageId,

        @NotNull(message = "Message cannot be empty")
        String content
) {
}
