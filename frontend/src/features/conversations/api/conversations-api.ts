import { ApiClientError, apiClient } from "../../../lib/api-client";
import type {
  ConversationParticipant,
  ConversationResponse,
  CreatePrivateConversationRequest
} from "../types/conversation.types";

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isConversationParticipant(
  value: unknown
): value is ConversationParticipant {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const participant = value as Record<string, unknown>;
  return (
    typeof participant.id === "number" &&
    typeof participant.email === "string" &&
    typeof participant.displayName === "string" &&
    isNullableString(participant.profileImageUrl) &&
    isNullableString(participant.about) &&
    (participant.lastSeenAt === undefined ||
      isNullableString(participant.lastSeenAt))
  );
}

function isConversationResponse(
  value: unknown
): value is ConversationResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const conversation = value as Record<string, unknown>;
  return (
    typeof conversation.id === "number" &&
    conversation.conversationType === "PRIVATE" &&
    isNullableString(conversation.title) &&
    isNullableString(conversation.imageUrl) &&
    isConversationParticipant(conversation.otherParticipant) &&
    isNullableString(conversation.lastMessageAt) &&
    typeof conversation.createdAt === "string" &&
    typeof conversation.updatedAt === "string"
  );
}

function unexpectedResponse(): never {
  throw new ApiClientError("Unexpected backend response.", "RESPONSE");
}

export async function getConversations(
  signal?: AbortSignal
): Promise<ConversationResponse[]> {
  const response = await apiClient.get<unknown>(
    "/api/v1/conversations",
    signal
  );

  return Array.isArray(response) && response.every(isConversationResponse)
    ? response
    : unexpectedResponse();
}

export async function createPrivateConversation(
  targetUserId: number
): Promise<ConversationResponse> {
  const request: CreatePrivateConversationRequest = { targetUserId };
  const response = await apiClient.post<unknown>(
    "/api/v1/conversations/private",
    request
  );
  return isConversationResponse(response)
    ? response
    : unexpectedResponse();
}

export async function getConversationById(
  conversationId: number,
  signal?: AbortSignal
): Promise<ConversationResponse> {
  const response = await apiClient.get<unknown>(
    `/api/v1/conversations/${conversationId}`,
    signal
  );
  return isConversationResponse(response)
    ? response
    : unexpectedResponse();
}
