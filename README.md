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

The MVP also includes profile editing, typing indicators, basic presence, and
last seen. It does not include unsupported chat features listed below.

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
- Profile editing, typing indicators, online/offline presence, and last seen
- Protected routes and APIs
- A basic responsive interface

The MVP does not include groups, attachments, calls, reactions, forwarding, or
message editing and deletion.

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
npm run build
```

Build the backend package:

```bash
cd backend
./mvnw clean package
```

More project details are available in the `docs` folder. Deployment notes are in
[`docs/deployment.md`](docs/deployment.md).

## Docker Image Builds

Phase 12 includes Dockerfiles for a production-style image build. The backend
image listens on port `8080`, and the frontend image serves the app through
nginx on port `80`.

```bash
docker build -t pinglix-backend ./backend
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  --build-arg VITE_WS_URL=ws://localhost:8080/ws \
  -t pinglix-frontend ./frontend
```

The example Compose file is kept separate from local development:

```bash
cd infrastructure
docker compose -f docker-compose.prod.example.yml config
```

Use an ignored `infrastructure/.env` file with real deployment values before
starting that example. Never commit passwords, JWT secrets, or cloud keys.

## Release and Demo Notes

This repository contains the Pinglix MVP release. The following documents help
with review and presentation:

- [MVP status](docs/mvp-status.md)
- [Demo walkthrough](docs/demo-walkthrough.md)
- [Release notes](docs/release-notes.md)
- [Portfolio summary](docs/portfolio-summary.md)
- [Future roadmap](docs/roadmap.md)

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
- Phase 10: Advanced messaging foundation
- Phase 11: MVP stabilization, QA, and documentation
- Phase 12: Deployment foundation and release preparation
- Phase 13: Final MVP release and portfolio preparation

Each phase should be completed and tested before the next one starts.

Phase 7 now supports live `MESSAGE_CREATED` events with WebSocket/STOMP. Text
messages are still sent and saved through REST. The frontend updates the open
conversation when a live event arrives and avoids duplicate messages.

Phase 8 improves the messaging screen. The desktop layout now has a clear
conversation sidebar and an active chat panel. On mobile, the user can open a
conversation and use the Back to Conversations button to return to the list.
The message composer also supports Enter to send and Shift+Enter for a new
line. Phase 8 does not add message status or other advanced chat features.

Phase 10 adds profile editing, temporary typing indicators, basic in-memory
online/offline presence, and a saved last-seen time. It does not add groups,
attachments, calls, reactions, or message editing.

Phase 11 checks the existing MVP, improves test isolation, and records setup,
security, testing, and feature-status notes. It does not add product features.

## Health Check

When the backend is running, check:

```text
http://localhost:8081/api/v1/health
```

## Known Limitations

- Presence is stored in memory and resets when the backend restarts.
- The MVP supports private text conversations only.
- Local development uses a non-secure cookie setting; production must use HTTPS
  and secure cookies.
- CSRF protection is disabled for this local MVP and must be reviewed before a
  cross-site production deployment.

## Future Improvements

Possible future work is listed in [docs/roadmap.md](docs/roadmap.md). These
items are not part of the current MVP.
