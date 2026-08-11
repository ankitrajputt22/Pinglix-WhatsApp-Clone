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
  | "MESSAGE_READ";

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

export type RealtimeEvent =
  | MessageCreatedEvent
  | MessageDeliveredEvent
  | MessageReadEvent;

export function parseMessageCreatedEvent(
  value: unknown
): MessageCreatedEvent | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const event = value as Record<string, unknown>;
  if (
    event.type !== "MESSAGE_CREATED" ||
    typeof event.conversationId !== "number" ||
    !isMessageResponse(event.message)
  ) {
    return null;
  }

  const message = event.message;
  if (message.conversationId !== event.conversationId) {
    return null;
  }

  return {
    type: "MESSAGE_CREATED",
    conversationId: event.conversationId,
    message
  };
}

export function parseRealtimeEvent(value: unknown): RealtimeEvent | null {
  const created = parseMessageCreatedEvent(value);
  if (created) {
    return created;
  }
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const event = value as Record<string, unknown>;
  if (
    typeof event.conversationId !== "number" ||
    !Array.isArray(event.messageIds) ||
    event.messageIds.length === 0 ||
    !event.messageIds.every((id) => typeof id === "number") ||
    typeof event.userId !== "number"
  ) {
    return null;
  }

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
