# Pinglix Final QA Checklist

Use this checklist before presenting or merging the MVP. The automated checks
should be run from the Phase 14 branch. The browser checks need two test users.

## Setup and health

- [ ] Start MySQL with `cd infrastructure && docker compose up -d`.
- [ ] Start the backend on `http://localhost:8081`.
- [ ] Start the frontend on `http://localhost:5174`.
- [ ] Confirm `GET /api/v1/health` returns `UP`.
- [ ] Confirm `GET /actuator/health` returns `UP`.

## Authentication and profile

- [ ] Register a user.
- [ ] Log in with valid credentials.
- [ ] Confirm invalid credentials show a safe error.
- [ ] Open the current profile.
- [ ] Edit display name, about text, and profile image URL.
- [ ] Confirm an anonymous user cannot open protected pages.
- [ ] Log out and confirm the session is cleared.

## Users and conversations

- [ ] Search for a registered user.
- [ ] Confirm the current user is not shown in search results.
- [ ] Create a private conversation.
- [ ] Repeat the request and confirm a duplicate conversation is not created.
- [ ] Confirm a non-member cannot view another conversation.

## Messages and real-time behavior

- [ ] Send a text message.
- [ ] Reload and confirm message history loads from MySQL.
- [ ] Open the same conversation in two browser sessions.
- [ ] Confirm a new message arrives without refreshing.
- [ ] Confirm sent, delivered, and read statuses update.
- [ ] Type in one session and confirm `Typing...` appears in the other.
- [ ] Stop typing and confirm the indicator clears.
- [ ] Disconnect one session and confirm offline status appears.
- [ ] Confirm the last-seen time appears after disconnect or logout.

## Layout and scope

- [ ] Test the messaging screen on a narrow mobile viewport.
- [ ] Confirm loading, empty, error, retry, and logout states are readable.
- [ ] Confirm there is no UI for groups, attachments, calls, reactions,
      forwarding, message editing, or message deletion.

## Automated checks

```bash
cd backend
./mvnw test
./mvnw clean package
```

```bash
cd frontend
npm install
npm test
npm run build
```
