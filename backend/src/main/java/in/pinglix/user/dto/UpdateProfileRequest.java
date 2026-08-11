package in.pinglix.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Display name is required")
        @Size(min = 2, max = 50, message = "Display name must be 2 to 50 characters")
        String displayName,

        @Size(max = 255, message = "About must be at most 255 characters")
        String about,

        @Size(max = 500, message = "Profile image URL must be at most 500 characters")
        @Pattern(
                regexp = "^$|https?://\\S+",
                message = "Profile image URL must be a valid URL"
        )
        String profileImageUrl
) {
}
