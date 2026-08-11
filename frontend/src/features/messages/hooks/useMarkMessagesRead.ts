import { useMutation } from "@tanstack/react-query";

import { markMessagesRead } from "../api/message-status-api";

export function useMarkMessagesRead() {
  return useMutation({
    mutationFn: ({ conversationId, messageIds }: {
      conversationId: number;
      messageIds: number[];
    }) => markMessagesRead(conversationId, messageIds)
  });
}
