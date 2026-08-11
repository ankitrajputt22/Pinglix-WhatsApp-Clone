package in.pinglix.message.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MessageStatusUpdateRequest(
        @NotEmpty(message = "Message IDs are required")
        List<@NotNull(message = "Message IDs are required")
                @Positive(message = "Message IDs are required") Long> messageIds
) {
}
