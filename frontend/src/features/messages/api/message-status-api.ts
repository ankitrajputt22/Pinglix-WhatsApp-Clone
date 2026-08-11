import { ApiClientError, apiClient } from "../../../lib/api-client";
import type {
  MessageStatusUpdateResponse
} from "../types/message.types";

function isMessageStatusUpdateResponse(
  value: unknown
): value is MessageStatusUpdateResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return (
    typeof response.conversationId === "number" &&
    (response.status === "DELIVERED" || response.status === "READ") &&
    Array.isArray(response.messageIds) &&
    response.messageIds.every((id) => typeof id === "number") &&
    typeof response.updatedCount === "number" &&
    typeof response.updatedAt === "string"
  );
}

function unexpectedResponse(): never {
  throw new ApiClientError("Unexpected backend response.", "RESPONSE");
}

async function updateMessageStatus(
  path: "delivered" | "read",
  conversationId: number,
  messageIds: number[]
) {
  const response = await apiClient.post<unknown>(
    `/api/v1/conversations/${conversationId}/messages/${path}`,
    { messageIds }
  );
  return isMessageStatusUpdateResponse(response)
    ? response
    : unexpectedResponse();
}

export function markMessagesDelivered(
  conversationId: number,
  messageIds: number[]
) {
  return updateMessageStatus("delivered", conversationId, messageIds);
}

export function markMessagesRead(conversationId: number, messageIds: number[]) {
  return updateMessageStatus("read", conversationId, messageIds);
}
