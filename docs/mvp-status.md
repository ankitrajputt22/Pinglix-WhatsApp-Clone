# Pinglix MVP Status

## Implemented

- Repository and backend foundation
- Spring Boot REST API with MySQL and Flyway
- Public health endpoint and actuator health endpoint
- Registration, login, logout, refresh, and current-user session
- BCrypt password hashing and HttpOnly cookie sessions
- Current profile, profile editing, and user search
- Private conversation creation and membership checks
- REST text messages and MySQL message history
- WebSocket/STOMP message delivery
- Sent, delivered, and read message statuses
- Typing indicators
- Basic in-memory online/offline presence
- Saved last-seen timestamps
- Responsive Pinglix messaging interface
- Automated backend and frontend tests
- Deployment foundation with Dockerfiles, nginx SPA fallback, and release notes

## Not implemented

- Group conversations
- Attachments
- Voice messages or video calls
- Reactions or forwarding
- Message editing or deletion
- Push notifications
- Admin dashboard or payments
- Redis, Kafka, microservices, Kubernetes
- End-to-end encryption claims
- Native mobile application

## Phase 11 result

Phase 11 stabilizes the existing MVP. It improves test database isolation,
checks the build and security boundaries, adds safe environment examples, and
documents setup, testing, security, and current product limits. It does not add
a new product feature.

## Phase 12 result

Phase 12 adds a production-style Docker build, an nginx frontend image, an
example Compose deployment, environment guidance, and deployment notes. It
does not add a new product feature or claim production-scale operation.

## Phase 13 result

Phase 13 prepares the MVP for portfolio review. It adds a repeatable demo
walkthrough, release notes, a portfolio summary, and a clear future roadmap.
It does not add a new product feature.

## Phase 14 result

Phase 14 performs final regression, security, build, documentation, and merge
readiness checks. It does not add a new product feature or database migration.
