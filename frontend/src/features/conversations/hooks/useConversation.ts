import { useQuery } from "@tanstack/react-query";

import { getConversationById } from "../api/conversations-api";

export function useConversation(conversationId: number | null) {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: ({ signal }) => {
      if (conversationId === null) {
        throw new Error("Conversation ID is required");
      }

      return getConversationById(conversationId, signal);
    },
    enabled: conversationId !== null
  });
}
