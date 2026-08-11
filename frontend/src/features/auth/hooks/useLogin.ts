import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginUser } from "../api/auth-api";
import { clearUserScopedQueries } from "../lib/auth-query-cache";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      clearUserScopedQueries(queryClient);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    }
  });
}
