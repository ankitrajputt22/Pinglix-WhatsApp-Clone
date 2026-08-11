import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { stompClient } from "../../../lib/stomp-client";
import { CONVERSATIONS_QUERY_KEY } from "../../conversations/hooks/useConversations";
import { markMessagesDelivered } from "../../messages/api/message-status-api";
import { messageQueryKey } from "../../messages/hooks/useMessages";
import { parseRealtimeEvent, type RealtimeConnectionStatus } from "../types/realtime.types";
import { addRealtimeMessage, updateRealtimeMessageStatuses, type MessageInfiniteData } from "../utils/realtime-dedup";

export function useConversationMessagesSubscription(
  conversationId: number | null,
  status: RealtimeConnectionStatus,
  currentUserId: number | null = null
) {
  const queryClient = useQueryClient();
  const [typingUserId, setTypingUserId] = useState<number | null>(null);
  const [presence, setPresence] = useState({ online: false, lastSeenAt: null as string | null });
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTypingUserId(null);
    setPresence({ online: false, lastSeenAt: null });
    if (typingTimeout.current !== null) clearTimeout(typingTimeout.current);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId === null || status !== "connected") return;
    return stompClient.subscribe(`/topic/conversations/${conversationId}`, (body) => {
      let parsed: unknown;
      try { parsed = JSON.parse(body); } catch { return; }
      const event = parseRealtimeEvent(parsed);
      if (!event || event.conversationId !== conversationId) return;

      if (event.type === "MESSAGE_CREATED") {
        queryClient.setQueryData<MessageInfiniteData>(
          messageQueryKey(conversationId),
          (current) => addRealtimeMessage(current, event.message)
        );
        if (currentUserId !== null && event.message.sender.id !== currentUserId) {
          queryClient.setQueryData<MessageInfiniteData>(
            messageQueryKey(conversationId),
            (current) => updateRealtimeMessageStatuses(current, [event.message.id], "DELIVERED")
          );
          void markMessagesDelivered(conversationId, [event.message.id]).catch(() => undefined);
        }
        void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      } else if (event.type === "MESSAGE_DELIVERED" || event.type === "MESSAGE_READ") {
        queryClient.setQueryData<MessageInfiniteData>(
          messageQueryKey(conversationId),
          (current) => updateRealtimeMessageStatuses(
            current,
            event.messageIds,
            event.type === "MESSAGE_READ" ? "READ" : "DELIVERED"
          )
        );
        void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      } else if (event.type === "TYPING_STARTED" || event.type === "TYPING_STOPPED") {
        if (event.userId === currentUserId) return;
        setTypingUserId(event.type === "TYPING_STARTED" ? event.userId : null);
        if (typingTimeout.current !== null) clearTimeout(typingTimeout.current);
        if (event.type === "TYPING_STARTED") {
          typingTimeout.current = setTimeout(() => setTypingUserId(null), 2500);
        }
      } else if (
        (event.type === "USER_ONLINE" || event.type === "USER_OFFLINE") &&
        event.userId !== currentUserId
      ) {
        setPresence({
          online: event.type === "USER_ONLINE",
          lastSeenAt: event.lastSeenAt
        });
      }
    });
  }, [conversationId, currentUserId, queryClient, status]);

  return { typingUserId, presence };
}
