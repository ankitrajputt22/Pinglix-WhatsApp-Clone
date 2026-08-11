import { useMutation } from "@tanstack/react-query";

import { markMessagesDelivered } from "../api/message-status-api";

export function useMarkMessagesDelivered() {
  return useMutation({
    mutationFn: ({ conversationId, messageIds }: {
      conversationId: number;
      messageIds: number[];
    }) => markMessagesDelivered(conversationId, messageIds)
  });
}
