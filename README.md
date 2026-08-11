# Pinglix

**Real-time conversations, instantly connected.**

Pinglix is a full-stack real-time messaging web application built with Spring Boot, React TypeScript, MySQL, and WebSocket/STOMP. It supports secure authentication, private conversations, persisted message history, and real-time message delivery through a clean, responsive, modern messaging interface.

Pinglix is not a direct clone of WhatsApp, Arattai, Telegram, or any existing messaging platform. Its user experience is inspired by familiar, friendly, and fast messaging patterns from these apps while maintaining an original Pinglix identity.

In short, Pinglix is a clean and modern app for instant private conversations.

## Main Goal

The main goal is to build a clean and secure messaging app. The project should be easy to maintain. It should also be ready for future improvements.

The first complete flow is:

1. Register
2. Login
3. Search for a user
4. Start a private conversation
5. Send a message
6. Save the message in MySQL
7. Receive the message in real time

Advanced features will be added only after this flow works well.

## MVP Scope

The MVP includes:

- Registration, login, and logout
- Basic user profiles
- User search
- Private conversations
- Text messages saved in MySQL
- Previous message history
- Recent conversations
- Real-time messages with WebSocket/STOMP
- Protected routes and APIs
- A basic responsive interface

The MVP does not include groups, attachments, calls, read receipts, typing indicators, presence, or message reactions.

## Main Technology

Frontend:

- React and TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- React Hook Form and Zod
- STOMP WebSocket client

Backend:

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- REST APIs
- WebSocket and STOMP
- Flyway

Database and local tools:

- MySQL
- Docker Compose
- InnoDB
- utf8mb4

## Local Ports

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8081`
- MySQL: `localhost:3306`

If the `pinglix` database already exists in local MySQL, Docker is not needed.
Make sure the local `pinglix` user has access to the database. The SQL commands
and connection test are in `docs/development-setup.md`.

## Run the Project

Start MySQL:

```bash
cd infrastructure
docker compose up -d
```

Start the backend:

```bash
cd ../backend
./mvnw spring-boot:run
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Run the tests:

```bash
cd backend
./mvnw test
```

```bash
cd frontend
npm test
```

More project details are available in the `docs` folder.

## Development Phases

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

Each phase should be completed and tested before the next one starts.

Phase 7 now supports live `MESSAGE_CREATED` events with WebSocket/STOMP. Text
messages are still sent and saved through REST. The frontend updates the open
conversation when a live event arrives and avoids duplicate messages.

Phase 8 improves the messaging screen. The desktop layout now has a clear
conversation sidebar and an active chat panel. On mobile, the user can open a
conversation and use the Back to Conversations button to return to the list.
The message composer also supports Enter to send and Shift+Enter for a new
line. Phase 8 does not add message status or other advanced chat features.

## Health Check

When the backend is running, check:

```text
http://localhost:8081/api/v1/health
```

## Future Improvements

Later versions may add message status, typing indicators, presence, groups, attachments, notifications, and better production deployment support.
