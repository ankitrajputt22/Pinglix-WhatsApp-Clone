import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiClientError } from "../../../lib/api-client";
import { logoutUser } from "../api/auth-api";
import { clearUserScopedQueries } from "../lib/auth-query-cache";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        return await logoutUser();
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          return { message: "Session already ended" };
        }

        throw error;
      }
    },
    onSettled: () => {
      clearUserScopedQueries(queryClient);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
    }
  });
}
