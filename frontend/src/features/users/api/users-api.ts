import { ApiClientError, apiClient } from "../../../lib/api-client";
import type {
  UserProfile,
  UserSearchResult
} from "../types/user.types";

function isPublicUser(value: unknown): value is UserSearchResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.email === "string" &&
    typeof user.displayName === "string" &&
    (user.profileImageUrl === null ||
      typeof user.profileImageUrl === "string") &&
    (user.about === null || typeof user.about === "string")
  );
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isPublicUser(value)) {
    return false;
  }

  const profile = value as unknown as Record<string, unknown>;
  return (
    typeof profile.accountStatus === "string" &&
    typeof profile.createdAt === "string"
  );
}

function unexpectedResponse(): never {
  throw new ApiClientError("Unexpected backend response.", "RESPONSE");
}

export async function getCurrentUserProfile(
  signal?: AbortSignal
): Promise<UserProfile> {
  const response = await apiClient.get<unknown>("/api/v1/users/me", signal);
  return isUserProfile(response) ? response : unexpectedResponse();
}

export async function searchUsers(
  query: string,
  signal?: AbortSignal
): Promise<UserSearchResult[]> {
  const normalizedQuery = query.trim();
  const response = await apiClient.get<unknown>(
    `/api/v1/users/search?query=${encodeURIComponent(normalizedQuery)}`,
    signal
  );

  return Array.isArray(response) && response.every(isPublicUser)
    ? response
    : unexpectedResponse();
}

export async function getUserById(
  id: number,
  signal?: AbortSignal
): Promise<UserSearchResult> {
  const response = await apiClient.get<unknown>(
    `/api/v1/users/${id}`,
    signal
  );
  return isPublicUser(response) ? response : unexpectedResponse();
}
