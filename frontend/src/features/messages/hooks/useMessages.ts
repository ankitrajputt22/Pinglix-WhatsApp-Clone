import { useInfiniteQuery } from "@tanstack/react-query";

import { getMessages } from "../api/messages-api";

export function messageQueryKey(conversationId: number | null) {
  return ["messages", conversationId] as const;
}

export function useMessages(conversationId: number | null) {
  return useInfiniteQuery({
    queryKey: messageQueryKey(conversationId),
    queryFn: ({ pageParam, signal }) => {
      if (conversationId === null) {
        throw new Error("Conversation ID is required");
      }

      return getMessages(
        conversationId,
        {
          beforeMessageId: pageParam,
          limit: 30
        },
        signal
      );
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.nextBeforeMessageId ?? undefined
        : undefined,
    enabled: conversationId !== null
  });
}
