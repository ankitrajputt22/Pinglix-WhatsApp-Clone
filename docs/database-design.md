# Pinglix Database Design

## Main Rules

Pinglix uses MySQL. The database name is `pinglix`.

The database uses:

- InnoDB
- utf8mb4
- UTC timestamps
- Foreign keys
- Useful indexes
- Flyway migrations

Tables must not be created by hand. Every schema change must use Flyway.

## Current MVP Scope

The current MVP uses the authentication, conversation, message, and receipt
migrations listed below. No Phase 11 schema migration was needed.

## Users

The `users` table stores:

- Email
- Password hash
- Display name
- Profile image URL
- About text
- Account status
- Login and activity times
- Created and updated times
- Soft delete time

Email must be unique.

`last_seen_at` is updated when a user logs out or their last WebSocket session
disconnects. Online presence itself is kept in memory and is not stored in a
separate table.

## Conversations

The `conversations` table stores common conversation details.

Main fields include:

- Conversation type
- Title
- Image URL
- Creator
- Last message ID
- Last message time
- Created and updated times

The first version only uses private conversations.

## Conversation Members

The `conversation_members` table links users to conversations.

A user can only appear once in the same conversation. Membership must be checked before messages or conversation details are returned.

## Private Conversations

The `private_conversations` table prevents duplicate private chats.

The smaller user ID is stored in `user_one_id`. The larger user ID is stored in `user_two_id`.

The pair must be unique:

```text
UNIQUE(user_one_id, user_two_id)
```

Phase 5 creates the conversation, two member rows, and the private conversation
row in one transaction. If one step fails, all three changes are rolled back.

The nullable `last_message_id` field starts as a placeholder in Phase 5. Phase 6
adds its foreign key after the messages table is created.

## Messages

The `messages` table stores REST-based text messages. It is created in Phase 6.

Important fields include:

- Conversation ID
- Sender ID
- Client message ID
- Message type
- Content
- Status
- Created time
- Edit and delete times

The `client_message_id` helps stop duplicate messages after a retry.

Only text messages are needed for the MVP.

Message creation and the conversation last-message update run in one
transaction. A unique sender and client message ID pair prevents duplicate
messages when a request is retried.

## Message Receipts

The `message_receipts` table is added in Phase 9. It stores one row per
recipient and message. It has `delivered_at` and `read_at` timestamps, a
unique `(message_id, user_id)` constraint, and indexes for conversation and
user lookups. Sending a message creates a receipt for the other private
conversation member. The sender does not get a receipt row.

## Later Tables

Message receipts can be used later for delivered and read times.

Attachments can be added later. MySQL should store file details only. The real files should go to object storage.

## Current Migration Order

- `V1__create_authentication_tables.sql`
- `V2__create_conversation_tables.sql`
- `V3__create_messages_table.sql`
- `V4__create_message_receipts_table.sql`

Attachments will use a later migration.

Phase 11 does not add attachments or any other unsupported table.
