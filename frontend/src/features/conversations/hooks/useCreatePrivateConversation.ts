import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPrivateConversation } from "../api/conversations-api";
import { CONVERSATIONS_QUERY_KEY } from "./useConversations";

export function useCreatePrivateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrivateConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        ["conversations", conversation.id],
        conversation
      );
      void queryClient.invalidateQueries({
        queryKey: CONVERSATIONS_QUERY_KEY
      });
    }
  });
}
