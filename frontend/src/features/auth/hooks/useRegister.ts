import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerUser } from "../api/auth-api";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    }
  });
}
