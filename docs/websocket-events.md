# Pinglix WebSocket Events

## Purpose

WebSocket/STOMP sends live events after a text message is saved through REST.
Phase 10 also uses the connection for typing and basic presence events.

The WebSocket endpoint is:

```text
/ws
```

The first subscription is:

```text
/topic/conversations/{conversationId}
```

The connection uses the existing HttpOnly access cookie. The backend checks
conversation membership before it accepts a subscription.

## MVP Message Flow

1. The frontend sends a message through REST.
2. The backend validates the request.
3. The backend checks conversation membership.
4. The message is saved in MySQL.
5. The database transaction finishes.
6. The backend publishes a WebSocket event.
7. The receiver gets the event.
8. The frontend updates the message list.

Message creation must not happen through both REST and WebSocket.

## First Event

The first event type is:

```text
MESSAGE_CREATED
```

Example:

```json
{
  "type": "MESSAGE_CREATED",
  "conversationId": 1,
  "message": {
    "id": 101,
    "clientMessageId": "temporary-client-id",
    "conversationId": 1,
    "sender": {
      "id": 5,
      "displayName": "Ankit",
      "email": "ankit@example.com",
      "profileImageUrl": null
    },
    "messageType": "TEXT",
    "content": "Hello",
    "status": "SENT",
    "createdAt": "2026-07-28T10:30:00Z",
    "editedAt": null,
    "deletedAt": null
  }
}
```

The frontend ignores invalid events. It also avoids duplicates by message ID
and client message ID.

## Message Status Events (Phase 9)

Status events are published to the same conversation topic after the receipt
transaction commits. They contain only IDs and timestamps:

```json
{
  "type": "MESSAGE_DELIVERED",
  "conversationId": 10,
  "messageIds": [101, 102],
  "userId": 2,
  "deliveredAt": "2026-08-08T00:30:00Z"
}
```

`MESSAGE_READ` has the same shape with `readAt`. The frontend updates its
message cache when either event arrives.

## Phase 10 Events

Typing events are sent to the selected conversation only:

```text
/app/conversations/{conversationId}/typing.start
/app/conversations/{conversationId}/typing.stop
```

The server publishes these event shapes to the conversation topic:

```json
{
  "type": "TYPING_STARTED",
  "conversationId": 10,
  "userId": 2
}
```

```json
{
  "type": "USER_OFFLINE",
  "conversationId": 10,
  "userId": 2,
  "lastSeenAt": "2026-08-12T00:30:00Z"
}
```

`USER_ONLINE` has the same shape with a null `lastSeenAt`. Presence is held in
memory for the running backend. `lastSeenAt` is saved on disconnect and logout.
Typing events are temporary and are never saved in MySQL.

## Later Events

These events can be added later:

- `MESSAGE_DELETED`
- `MESSAGE_UPDATED`

Attachments, calls, groups, reactions, and other advanced events are not part
of the current implementation.

The broker uses in-memory presence for this MVP. A backend restart clears online
users; the saved `lastSeenAt` value remains in MySQL.
