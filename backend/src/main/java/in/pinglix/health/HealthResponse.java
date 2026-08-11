package in.pinglix.health;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HealthResponse(
        String status,
        String application,
        String message,
        Instant timestamp
) {

    @JsonProperty("app")
    public String app() {
        return application;
    }
}
