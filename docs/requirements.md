# Pinglix Requirements

## Project Identity

- Name: Pinglix
- Website: pinglix.in
- Tagline: Real-time conversations, instantly connected.
- Type: Full-stack real-time messaging web application
- Repository name: pinglix
- Database name: pinglix
- Frontend title: Pinglix

Pinglix is an original messaging app. It does not copy another messaging app. It should feel clean, secure, fast, friendly, and easy to use.

## Main Working Flow

The first complete flow must be:

1. Register
2. Login
3. Search for a user
4. Start a private conversation
5. Send a text message
6. Save the message in MySQL
7. Receive the message in real time

This flow must work before advanced features are added.

## MVP Features

The first version must include:

- User registration
- Login and logout
- Refresh token support
- Current user details
- Basic user profile
- Search for registered users
- Start a private conversation
- Prevent duplicate private conversations
- Show recent conversations
- Send text messages
- Save messages in MySQL
- Load older messages
- Receive new messages with WebSocket/STOMP
- Protected frontend routes
- Protected backend APIs
- Basic responsive design
- Clear loading, error, and empty states

## Not Part of the MVP

The first version will not include:

- Group chats
- Attachments
- Voice messages
- Video calls
- Read receipts
- Typing indicators
- Online or offline status
- Last seen
- Message reactions
- Message forwarding
- End-to-end encryption claims
- Admin dashboard
- Microservices
- Kubernetes
- Kafka

These features can be planned after the MVP is stable.

## Security Requirements

- JWT tokens must not be stored in local storage.
- Access and refresh tokens should use HttpOnly cookies.
- Passwords must use BCrypt hashing.
- Backend routes must check authentication.
- Frontend routes must protect private pages.
- A user can only open or use a conversation if they are a member.
- Membership checks must happen inside service methods.
- CORS must allow only trusted frontend origins.
- Secrets must not be added to Git.

## Non-Functional Requirements

- The code should be simple and easy to maintain.
- The UI should work on mobile, tablet, and desktop.
- API responses should use clear and consistent formats.
- Loading, error, and empty states should be easy to understand.
- Database changes should be safe and repeatable with Flyway.
- The project should be ready for future production improvements.
- The app should stay fast and avoid unnecessary features.

## UI Requirements

The interface should be simple and responsive. It should work on desktop, tablet, and mobile.

The main messaging page will include:

- Recent conversation list
- User search
- Selected conversation area
- Chat user information
- Message history
- Message input
- Profile area
- Loading states
- Error states
- Empty states

The UI may use good ideas from WhatsApp, Arattai, and Telegram. It must not copy their exact design. The final UI must look and feel like Pinglix.

## Phase-by-Phase Rule

Only one phase should be added at a time. Each phase should be tested before the next phase starts.

The Phase 1 scope only includes the repository and backend foundation. Authentication, frontend work, conversations, messages, and WebSocket belong to later phases.
