# Pinglix MVP Demo Walkthrough

This walkthrough shows the main Pinglix flow for a college presentation or a
local demo.

## Start the application

1. Start MySQL:

   ```bash
   cd infrastructure
   docker compose up -d
   ```

2. Start the backend in another terminal:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. Start the frontend in a third terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5174`.

## Demo flow

1. Register user A with a display name.
2. Register user B in a second browser or private window.
3. Log in as user A.
4. Open the profile and update the display name, about text, or image URL.
5. Search for user B.
6. Start a private conversation with user B.
7. Open the same conversation as user B in the second browser.
8. Send a text message from user A and show it arriving for user B without a
   page refresh.
9. Reply as user B and show the same real-time flow in the other direction.
10. Show the sent, delivered, and read message statuses.
11. Type in one browser and show `Typing...` in the other browser.
12. Close or log out of one browser and show the other user becoming offline.
13. Show the saved last-seen time.
14. Log out from both accounts.

## Useful checks

```bash
curl http://localhost:8081/api/v1/health
curl http://localhost:8081/actuator/health
```

The demo uses private text conversations only. Attachments, groups, calls,
reactions, and other future features are not part of this walkthrough.
