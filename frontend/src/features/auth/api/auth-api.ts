import { ApiClientError, apiClient } from "../../../lib/api-client";
import type {
  AccountStatus,
  AuthUser,
  LoginPayload,
  MessageResponse,
  RegisterPayload
} from "../types/auth.types";

const accountStatuses: AccountStatus[] = [
  "ACTIVE",
  "LOCKED",
  "DISABLED",
  "DELETED"
];

function isAuthUser(value: unknown): value is AuthUser {
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
    typeof user.accountStatus === "string" &&
    accountStatuses.includes(user.accountStatus as AccountStatus) &&
    typeof user.createdAt === "string"
  );
}

function ensureAuthUser(value: unknown): AuthUser {
  if (!isAuthUser(value)) {
    throw new ApiClientError(
      "Unexpected backend response.",
      "RESPONSE"
    );
  }

  return value;
}

export async function registerUser(
  payload: RegisterPayload
): Promise<AuthUser> {
  return ensureAuthUser(
    await apiClient.post<unknown>("/api/v1/auth/register", payload)
  );
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  return ensureAuthUser(
    await apiClient.post<unknown>("/api/v1/auth/login", payload)
  );
}

export async function logoutUser(): Promise<MessageResponse> {
  return apiClient.post<MessageResponse>("/api/v1/auth/logout");
}

export async function refreshSession(): Promise<AuthUser> {
  return ensureAuthUser(
    await apiClient.post<unknown>("/api/v1/auth/refresh")
  );
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  return ensureAuthUser(
    await apiClient.get<unknown>("/api/v1/auth/me", signal)
  );
}
