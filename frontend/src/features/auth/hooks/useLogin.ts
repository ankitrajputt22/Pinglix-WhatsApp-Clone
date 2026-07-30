import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginUser } from "../api/auth-api";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    }
  });
}
