# Pinglix Portfolio Summary

## Project summary

Pinglix is a full-stack real-time messaging web application. It lets registered
users search for each other, start private conversations, send text messages,
and receive new messages in real time.

## What Pinglix demonstrates

The project demonstrates how a small messaging product can be planned,
implemented, tested, and prepared for a portfolio. It uses a simple modular
backend and a feature-based frontend. The interface has its own Pinglix style
and is not a direct copy of another messaging app.

## Skills shown

### Backend

- Java 21 and Spring Boot REST APIs
- Spring Data JPA and service-layer design
- Validation, common errors, and profile-based configuration
- Flyway database migrations

### Frontend

- React and TypeScript
- Vite, React Router, and TanStack Query
- Tailwind CSS and responsive layouts
- Reusable API, profile, conversation, and messaging components

### Database

- MySQL and relational table design
- Foreign keys, unique constraints, and indexes
- Persisted users, conversations, messages, receipts, and last-seen data

### Real-time systems

- WebSocket/STOMP connections
- Conversation-scoped message delivery
- Typing events and in-memory online presence
- Delivered and read receipt updates

### Security and authentication

- BCrypt password hashing
- HttpOnly access and refresh cookies
- Configurable CORS
- Authentication and conversation membership checks
- No token storage in localStorage or sessionStorage

### Testing and documentation

- Backend integration and unit tests
- Frontend component and flow tests
- Build checks and deployment documentation
- A repeatable local demo walkthrough

## Tradeoffs and limitations

Pinglix is a portfolio MVP, not a large-scale production service. Presence is
kept in memory, the app supports private text conversations only, and the
deployment foundation does not include a cloud provider, TLS setup, backups,
monitoring, or horizontal scaling. These choices keep the project simple and
easy to run locally while leaving clear paths for future work.
