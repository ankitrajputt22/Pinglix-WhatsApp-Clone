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
