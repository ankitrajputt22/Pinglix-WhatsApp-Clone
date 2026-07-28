# Requirements

## Phase 0 and Phase 1 scope

Pinglix must provide a working backend foundation before application features
are introduced.

### Functional requirement

- `GET /api/v1/health` is public and returns HTTP 200 with `status`,
  `application`, `message`, and an ISO-8601 `timestamp`.

### Operational requirements

- The backend targets Java 21 and listens on port 8080 by default.
- MySQL runs through Docker Compose on local port 3306.
- The database name is `pinglix`, with InnoDB and `utf8mb4`.
- Flyway owns future schema changes.
- Backend startup fails clearly when the configured database or Flyway is
  unavailable.
- Actuator exposes a health endpoint.
- Production database secrets come only from environment variables.

### Explicitly deferred

Frontend UI, authentication, users, conversations, messages, WebSocket/STOMP,
attachments, presence, groups, and other advanced features are outside this
phase.

