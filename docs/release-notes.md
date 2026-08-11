# Pinglix MVP Release Notes

## Release

- Name: Pinglix MVP
- Version: MVP v1.0
- Status: Portfolio-ready local MVP

## Included features

- User registration, login, logout, refresh, and current-user session
- User profiles, profile editing, and user search
- Private conversations with membership checks
- REST-based text messages and message history
- Sent, delivered, and read message statuses
- WebSocket/STOMP real-time message delivery
- Typing indicators
- Basic online/offline presence
- Last-seen timestamps
- Responsive Pinglix messaging interface
- MySQL, Flyway, Docker Compose, and deployment guidance

## Technical highlights

- Java 21 and Spring Boot backend
- React, TypeScript, Vite, Tailwind CSS, and TanStack Query frontend
- MySQL with Flyway migrations
- HttpOnly cookie authentication with BCrypt password hashing
- REST and WebSocket/STOMP used for their separate responsibilities
- Automated backend and frontend tests

## Security highlights

- Password hashes are never returned by the API.
- Tokens use HttpOnly cookies and are not stored in browser storage.
- Conversation membership is checked for protected actions.
- Secrets and deployment values are supplied through environment variables.

## Known limitations

- The MVP supports private text conversations only.
- Presence is stored in memory and resets when the backend restarts.
- CSRF protection needs to be added before a cross-site production deployment.
- The deployment foundation does not include TLS, backups, monitoring, or
  horizontal scaling.

## Future improvements

The roadmap contains possible future features. They are not included in MVP
v1.0.
