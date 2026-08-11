# Pinglix MVP Testing Checklist

Use two test users where a step needs a conversation or real-time behavior.

## Authentication and profile

- [ ] Register a new user.
- [ ] Log in with valid credentials.
- [ ] Confirm invalid credentials show a safe error.
- [ ] Open the current profile.
- [ ] Edit display name, about text, and profile image URL.
- [ ] Confirm logout clears the session and returns to login.

## Users and conversations

- [ ] Search for a registered user.
- [ ] Confirm the current user is not shown in search results.
- [ ] Create a private conversation.
- [ ] Repeat the same request and confirm a duplicate conversation is not made.
- [ ] Confirm a non-member cannot view another conversation.

## Messages and realtime behavior

- [ ] Send a text message through the composer.
- [ ] Reload and confirm message history loads from MySQL.
- [ ] Open the same conversation in two browser sessions.
- [ ] Confirm a new message arrives without refreshing.
- [ ] Confirm sent, delivered, and read status changes appear.
- [ ] Type in one session and confirm the other session shows `Typing...`.
- [ ] Stop typing and confirm the indicator clears.
- [ ] Connect and disconnect a session and confirm online/offline status.
- [ ] Confirm a last-seen time appears after the other user goes offline.

## Layout and health

- [ ] Check the health endpoint at `http://localhost:8081/api/v1/health`.
- [ ] Check the actuator endpoint at `http://localhost:8081/actuator/health`.
- [ ] Check the app at `http://localhost:5174`.
- [ ] Test the conversation layout on a narrow mobile viewport.
- [ ] Confirm there is no horizontal page scrolling.
- [ ] Confirm loading, empty, error, retry, and logout states are readable.

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
