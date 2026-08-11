# Pinglix Architecture

## Main Structure

Pinglix uses one repository. It contains:

- `backend`
- `frontend`
- `infrastructure`
- `docs`

The backend is a modular monolith. Microservices are not needed for the first version.

## Technology

Frontend:

- React and TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Radix UI or other accessible tools when needed
- React Hook Form and Zod
- STOMP WebSocket client
- Vitest and React Testing Library
- Playwright later

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation
- Spring WebSocket and STOMP
- Flyway
- Spring Boot Actuator
- Spring Boot DevTools for local work only
- JUnit, Mockito, and MockMvc
- Testcontainers later

Database and tools:

- MySQL
- InnoDB
- utf8mb4
- Docker Compose
- GitHub Actions later
- Object storage later for attachments
- Redis later only if it is needed

## Backend

The backend uses Java 21 and Spring Boot.

Code is grouped by feature. Main features include:

- Authentication
- Users
- Conversations
- Messages
- Real-time events
- Security
- Common errors
- Configuration

Controllers should stay small. Services should contain business rules. Repositories should only handle database queries.

The API must use request and response DTOs. JPA entities must not be returned directly. Mappers should turn entities into safe responses.

Transactions are needed when creating conversations and messages. Flyway must be used for every database change.

The current Java package is `in.pinglix`.

The original project plan used `com.yourname.pinglix` as a placeholder. This project uses `in.pinglix` as its real package.

## Frontend

The frontend uses React and TypeScript. It uses a feature-based folder structure.

Main frontend features include:

- Authentication
- Users
- Conversations
- Messages
- Real-time updates
- Profile
- Settings

TanStack Query handles REST server data. React Hook Form and Zod handle forms. Tailwind CSS handles the design.

WebSocket code must stay separate from normal API code. Tokens must not be stored in local storage.

## Database and Flyway

MySQL uses InnoDB, utf8mb4, and UTC-friendly timestamps. Flyway controls every schema change. Hibernate validates the schema and does not create production tables.

## Security

Authentication uses a short-lived JWT access token and a refresh token. Both tokens are sent with HttpOnly cookies. Refresh tokens are hashed before they are saved. A refresh request rotates the token, and logout revokes it.

Passwords use BCrypt hashing. Backend routes are protected by default. CORS only allows configured frontend origins.

CSRF is disabled for the current stateless API. Local cookies use `SameSite=Lax`, and CORS only allows trusted origins with credentials. A CSRF token should be added before cross-site clients or more sensitive state-changing features are supported.

## Why a Modular Monolith

Pinglix is a learning and portfolio project. A modular monolith is easier to build, test, and run. It still keeps features separate. Microservices can be considered later only if there is a real need.

## REST and WebSocket

REST APIs handle:

- Register, login, logout, and refresh
- Current user details
- User search
- Creating and loading conversations
- Loading older messages
- Sending messages in the MVP

WebSocket/STOMP handles:

- New message events
- Delivery events later
- Read events later
- Typing events later
- Presence later

A message is first saved through REST. The backend publishes the WebSocket
event after the database transaction commits. This avoids two different
message creation paths.

The WebSocket handshake uses the existing HttpOnly access cookie. A channel
interceptor checks that the user is a member before allowing a conversation
topic subscription.

## Development Phases

The project follows this order:

- Phase 0: Repository setup
- Phase 1: Backend foundation
- Phase 2: Frontend foundation
- Phase 3: Authentication
- Phase 4: User module
- Phase 5: Private conversation module
- Phase 6: Message module
- Phase 7: Real-time messaging
- Phase 8: UI improvements
- Phase 9: Message status
- Phase 10: Advanced features

Each phase should be completed and tested before the next phase starts.

## Later Production Work

Production deployment is not part of the current work. Later work may include HTTPS, environment variables, secure cookies, logs, health checks, CI/CD, and basic monitoring.
