import { ApiClientError, apiClient } from "../../../lib/api-client";
import type {
  GetMessagesParams,
  MessagePageResponse,
  MessageResponse,
  MessageSender,
  SendMessageRequest
} from "../types/message.types";

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isMessageSender(value: unknown): value is MessageSender {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const sender = value as Record<string, unknown>;
  return (
    typeof sender.id === "number" &&
    typeof sender.email === "string" &&
    typeof sender.displayName === "string" &&
    isNullableString(sender.profileImageUrl)
  );
}

export function isMessageResponse(value: unknown): value is MessageResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "number" &&
    typeof message.clientMessageId === "string" &&
    typeof message.conversationId === "number" &&
    isMessageSender(message.sender) &&
    message.messageType === "TEXT" &&
    typeof message.content === "string" &&
    (message.status === "SENT" ||
      message.status === "DELIVERED" ||
      message.status === "READ") &&
    typeof message.createdAt === "string" &&
    isNullableString(message.editedAt) &&
    isNullableString(message.deletedAt)
  );
}

function unexpectedResponse(): never {
  throw new ApiClientError("Unexpected backend response.", "RESPONSE");
}

export async function getMessages(
  conversationId: number,
  params: GetMessagesParams = {},
  signal?: AbortSignal
): Promise<MessagePageResponse> {
  const query = new URLSearchParams();
  if (params.beforeMessageId !== undefined) {
    query.set("beforeMessageId", String(params.beforeMessageId));
  }
  query.set("limit", String(params.limit ?? 30));

  const response = await apiClient.get<unknown>(
    `/api/v1/conversations/${conversationId}/messages?${query.toString()}`,
    signal
  );

  if (typeof response !== "object" || response === null) {
    return unexpectedResponse();
  }

  const page = response as Record<string, unknown>;
  if (
    !Array.isArray(page.items) ||
    !page.items.every(isMessageResponse) ||
    !(
      page.nextBeforeMessageId === null ||
      typeof page.nextBeforeMessageId === "number"
    ) ||
    typeof page.hasMore !== "boolean"
  ) {
    return unexpectedResponse();
  }

  return page as MessagePageResponse;
}

export async function sendMessage(
  conversationId: number,
  payload: SendMessageRequest
): Promise<MessageResponse> {
  const response = await apiClient.post<unknown>(
    `/api/v1/conversations/${conversationId}/messages`,
    payload
  );
  return isMessageResponse(response) ? response : unexpectedResponse();
}
