import { useQuery } from "@tanstack/react-query";

import { ApiClientError } from "../../../lib/api-client";
import {
  getCurrentUser,
  refreshSession
} from "../api/auth-api";
import type { AuthUser } from "../types/auth.types";

export const CURRENT_USER_QUERY_KEY = ["auth", "current-user"] as const;

async function resolveCurrentUser(signal?: AbortSignal): Promise<AuthUser | null> {
  try {
    return await getCurrentUser(signal);
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401) {
      throw error;
    }
  }

  try {
    return await refreshSession();
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: ({ signal }) => resolveCurrentUser(signal)
  });
}
