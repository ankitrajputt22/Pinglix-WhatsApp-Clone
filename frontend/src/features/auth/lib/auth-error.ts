import { ApiClientError } from "../../../lib/api-client";

export function authErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  if (error.kind === "NETWORK") {
    return "Unable to connect. Please try again.";
  }

  if (error.code === "DUPLICATE_RESOURCE") {
    return "Email is already registered";
  }

  if (error.code === "INVALID_CREDENTIALS") {
    return "Invalid email or password";
  }

  if (error.kind === "RESPONSE" || (error.status ?? 0) >= 500) {
    return fallback;
  }

  return error.message;
}
