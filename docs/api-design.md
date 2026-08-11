# Pinglix API Design

## Base Path

All main REST endpoints use:

```text
/api/v1
```

## Phase 1 Scope

Only this Pinglix API route belongs to the Phase 1 implementation:

```http
GET /api/v1/health
```

It is public and does not need authentication.

All routes below are planned for later phases. On the current Phase 5 branch, some of them already exist because later work is being kept.

## Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

JWT access and refresh tokens use HttpOnly cookies. Tokens must not be sent in normal API response bodies.

## Users

```http
GET   /api/v1/users/me
PATCH /api/v1/users/me
GET   /api/v1/users/search?query=
GET   /api/v1/users/{id}
```

The authenticated user can update only their own display name, about text, and
profile image URL:

```http
PATCH /api/v1/users/me
```

Email and password changes are not part of this endpoint.

## Conversations

```http
GET  /api/v1/conversations
POST /api/v1/conversations/private
GET  /api/v1/conversations/{conversationId}
```

These routes are implemented in Phase 5. All conversation routes require login.
A user can only view conversations where they are a member.

The private conversation route returns HTTP 200 for both a new conversation
and an existing conversation. This keeps the frontend flow simple. The backend
still prevents duplicate private conversations.

Phase 5 creates and loads private conversation details. Phase 6 adds REST-based
text messages to these conversations.

## Messages

```http
GET  /api/v1/conversations/{conversationId}/messages
POST /api/v1/conversations/{conversationId}/messages
```

These routes are implemented in Phase 6. They require login and conversation
membership. Messages are limited to 4000 characters.

Older messages should use cursor pagination:

```http
GET /api/v1/conversations/{conversationId}/messages?beforeMessageId=100&limit=30
```

The app still sends and loads messages through REST. Phase 7 publishes a
`MESSAGE_CREATED` event after a new message transaction is committed.

The real-time endpoint is:

```text
ws://localhost:8081/ws
```

Conversation members can subscribe to:

```text
/topic/conversations/{conversationId}
```

There is no WebSocket send destination. REST remains the only message send
path.

### Message Status (Phase 9)

Logged-in conversation members can update their own recipient receipts:

```http
POST /api/v1/conversations/{conversationId}/messages/delivered
POST /api/v1/conversations/{conversationId}/messages/read
```

Both routes accept `{ "messageIds": [101, 102] }`. The response reports the
newly updated IDs, count, status, and timestamp. A read update also sets the
delivered time when it is still empty. Messages sent by the current user have
their `SENT`, `DELIVERED`, or `READ` status derived from recipient receipts.

### Advanced Messaging (Phase 10)

Phase 10 adds profile editing through `PATCH /api/v1/users/me`. It also adds
typing and presence events through the existing WebSocket connection. Typing
events are sent only for the selected conversation and are not stored.

The current user is identified from the authenticated session. A user must be
an active conversation member before sending typing events.

## Error Response

Errors use one common shape:

```json
{
  "timestamp": "2026-07-28T10:30:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Message content cannot be empty",
  "path": "/api/v1/conversations/12/messages"
}
```

Common error codes include:

- `VALIDATION_ERROR`
- `AUTHENTICATION_REQUIRED`
- `ACCESS_DENIED`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_RESOURCE`
- `INVALID_CREDENTIALS`
- `CONVERSATION_ACCESS_DENIED`
- `MESSAGE_SEND_FAILED`
- `INTERNAL_SERVER_ERROR`

API responses must not include passwords, token hashes, cookies, or other private security data.
