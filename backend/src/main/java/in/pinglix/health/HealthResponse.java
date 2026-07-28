package in.pinglix.health;

import java.time.Instant;

public record HealthResponse(
        String status,
        String application,
        String message,
        Instant timestamp
) {
}

