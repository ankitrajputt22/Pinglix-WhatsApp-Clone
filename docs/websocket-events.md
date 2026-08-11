# Pinglix WebSocket Events

## Purpose

WebSocket/STOMP is added in Phase 7. It sends a live event after a text
message is saved through REST.

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

## Later Events

These events can be added later:

- `MESSAGE_DELETED`
- `MESSAGE_UPDATED`
- `TYPING_STARTED`
- `TYPING_STOPPED`
- `USER_ONLINE`
- `USER_OFFLINE`

Typing, read receipts, delivery receipts, and presence are not part of Phase 7.
