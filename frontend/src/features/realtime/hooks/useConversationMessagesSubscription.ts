import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { stompClient } from "../../../lib/stomp-client";
import { CONVERSATIONS_QUERY_KEY } from "../../conversations/hooks/useConversations";
import { markMessagesDelivered } from "../../messages/api/message-status-api";
import { messageQueryKey } from "../../messages/hooks/useMessages";
import {
  parseRealtimeEvent,
  type RealtimeConnectionStatus
} from "../types/realtime.types";
import {
  addRealtimeMessage,
  updateRealtimeMessageStatuses,
  type MessageInfiniteData
} from "../utils/realtime-dedup";

export function useConversationMessagesSubscription(
  conversationId: number | null,
  status: RealtimeConnectionStatus,
  currentUserId: number | null = null
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (conversationId === null || status !== "connected") {
      return;
    }

    return stompClient.subscribe(
      `/topic/conversations/${conversationId}`,
      (body) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          return;
        }

        const event = parseRealtimeEvent(parsed);
        if (!event || event.conversationId !== conversationId) {
          return;
        }

        if (event.type === "MESSAGE_CREATED") {
          queryClient.setQueryData<MessageInfiniteData>(
            messageQueryKey(conversationId),
            (current) => addRealtimeMessage(current, event.message)
          );
          if (
            currentUserId !== null &&
            event.message.sender.id !== currentUserId
          ) {
            queryClient.setQueryData<MessageInfiniteData>(
              messageQueryKey(conversationId),
              (current) => updateRealtimeMessageStatuses(
                current,
                [event.message.id],
                "DELIVERED"
              )
            );
            void markMessagesDelivered(conversationId, [event.message.id])
              .catch(() => undefined);
          }
        } else {
          queryClient.setQueryData<MessageInfiniteData>(
            messageQueryKey(conversationId),
            (current) => updateRealtimeMessageStatuses(
              current,
              event.messageIds,
              event.type === "MESSAGE_READ" ? "READ" : "DELIVERED"
            )
          );
        }
        void queryClient.invalidateQueries({
          queryKey: CONVERSATIONS_QUERY_KEY
        });
      }
    );
  }, [conversationId, currentUserId, queryClient, status]);
}
