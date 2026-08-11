import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CONVERSATIONS_QUERY_KEY } from "../../conversations/hooks/useConversations";
import {
  addRealtimeMessage,
  type MessageInfiniteData
} from "../../realtime/utils/realtime-dedup";
import { sendMessage } from "../api/messages-api";
import type { SendMessageRequest } from "../types/message.types";
import { messageQueryKey } from "./useMessages";

type SendMessageVariables = {
  conversationId: number;
  payload: SendMessageRequest;
};

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, payload }: SendMessageVariables) =>
      sendMessage(conversationId, payload),
    onSuccess: (message) => {
      queryClient.setQueryData<MessageInfiniteData>(
        messageQueryKey(message.conversationId),
        (current) => addRealtimeMessage(current, message)
      );
      void queryClient.invalidateQueries({
        queryKey: messageQueryKey(message.conversationId)
      });
      void queryClient.invalidateQueries({
        queryKey: CONVERSATIONS_QUERY_KEY
      });
    }
  });
}
