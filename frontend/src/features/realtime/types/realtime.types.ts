import { isMessageResponse } from "../../messages/api/messages-api";
import type { MessageResponse } from "../../messages/types/message.types";

export type RealtimeConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export type RealtimeEventType =
  | "MESSAGE_CREATED"
  | "MESSAGE_DELIVERED"
  | "MESSAGE_READ"
  | "TYPING_STARTED"
  | "TYPING_STOPPED"
  | "USER_ONLINE"
  | "USER_OFFLINE";

export type MessageCreatedEvent = {
  type: "MESSAGE_CREATED";
  conversationId: number;
  message: MessageResponse;
};
export type MessageDeliveredEvent = {
  type: "MESSAGE_DELIVERED";
  conversationId: number;
  messageIds: number[];
  userId: number;
  deliveredAt: string;
};
export type MessageReadEvent = {
  type: "MESSAGE_READ";
  conversationId: number;
  messageIds: number[];
  userId: number;
  readAt: string;
};
export type TypingEvent = {
  type: "TYPING_STARTED" | "TYPING_STOPPED";
  conversationId: number;
  userId: number;
};
export type PresenceEvent = {
  type: "USER_ONLINE" | "USER_OFFLINE";
  conversationId: number;
  userId: number;
  lastSeenAt: string | null;
};
export type RealtimeEvent =
  | MessageCreatedEvent
  | MessageDeliveredEvent
  | MessageReadEvent
  | TypingEvent
  | PresenceEvent;

export function parseMessageCreatedEvent(
  value: unknown
): MessageCreatedEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const event = value as Record<string, unknown>;
  if (
    event.type !== "MESSAGE_CREATED" ||
    typeof event.conversationId !== "number" ||
    !isMessageResponse(event.message)
  ) return null;
  const message = event.message;
  return message.conversationId === event.conversationId
    ? { type: "MESSAGE_CREATED", conversationId: event.conversationId, message }
    : null;
}

export function parseRealtimeEvent(value: unknown): RealtimeEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const event = value as Record<string, unknown>;
  const created = parseMessageCreatedEvent(value);
  if (created) return created;

  if (
    (event.type === "TYPING_STARTED" || event.type === "TYPING_STOPPED") &&
    typeof event.conversationId === "number" &&
    typeof event.userId === "number"
  ) {
    return {
      type: event.type,
      conversationId: event.conversationId,
      userId: event.userId
    };
  }
  if (
    (event.type === "USER_ONLINE" || event.type === "USER_OFFLINE") &&
    typeof event.conversationId === "number" &&
    typeof event.userId === "number" &&
    (event.lastSeenAt === null || typeof event.lastSeenAt === "string")
  ) {
    return {
      type: event.type,
      conversationId: event.conversationId,
      userId: event.userId,
      lastSeenAt: event.lastSeenAt
    };
  }
  if (
    typeof event.conversationId !== "number" ||
    !Array.isArray(event.messageIds) ||
    event.messageIds.length === 0 ||
    !event.messageIds.every((id) => typeof id === "number") ||
    typeof event.userId !== "number"
  ) return null;
  if (
    event.type === "MESSAGE_DELIVERED" &&
    typeof event.deliveredAt === "string"
  ) {
    return {
      type: "MESSAGE_DELIVERED",
      conversationId: event.conversationId,
      messageIds: event.messageIds,
      userId: event.userId,
      deliveredAt: event.deliveredAt
    };
  }
  if (event.type === "MESSAGE_READ" && typeof event.readAt === "string") {
    return {
      type: "MESSAGE_READ",
      conversationId: event.conversationId,
      messageIds: event.messageIds,
      userId: event.userId,
      readAt: event.readAt
    };
  }
  return null;
}
