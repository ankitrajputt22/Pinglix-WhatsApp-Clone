import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createQueryClient } from "../../lib/query-client";
import { stompClient } from "../../lib/stomp-client";
import { CONVERSATIONS_QUERY_KEY } from "../conversations/hooks/useConversations";
import { messageQueryKey } from "../messages/hooks/useMessages";
import type { MessageResponse } from "../messages/types/message.types";
import { RealtimeStatusIndicator } from "./components/RealtimeStatusIndicator";
import { useConversationMessagesSubscription } from "./hooks/useConversationMessagesSubscription";
import type { RealtimeConnectionStatus } from "./types/realtime.types";
import type { MessageInfiniteData } from "./utils/realtime-dedup";

const incomingMessage: MessageResponse = {
  id: 101,
  clientMessageId: "b8b19344-9d6f-4f81-b536-3de34a7de1df",
  conversationId: 10,
  sender: {
    id: 2,
    email: "ankush@example.com",
    displayName: "Ankush",
    profileImageUrl: null
  },
  messageType: "TEXT",
  content: "A real-time message",
  status: "SENT",
  createdAt: "2026-08-08T00:30:00Z",
  editedAt: null,
  deletedAt: null
};

function SubscriptionHarness({
  conversationId,
  status
}: {
  conversationId: number | null;
  status: RealtimeConnectionStatus;
}) {
  useConversationMessagesSubscription(conversationId, status);
  return null;
}

describe("real-time messaging", () => {
  it.each([
    ["connecting", "Connecting..."],
    ["connected", "Live"],
    ["disconnected", "Disconnected"],
    ["reconnecting", "Reconnecting..."],
    ["error", "Disconnected"]
  ] as const)("renders the %s connection status", (status, label) => {
    render(<RealtimeStatusIndicator status={status} />);
    expect(screen.getByRole("status")).toHaveTextContent(label);
  });

  it("adds a MESSAGE_CREATED event once and refreshes conversations", () => {
    const queryClient = createQueryClient();
    const initialData: MessageInfiniteData = {
      pages: [
        {
          items: [],
          nextBeforeMessageId: null,
          hasMore: false
        }
      ],
      pageParams: [undefined]
    };
    queryClient.setQueryData(messageQueryKey(10), initialData);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    let receive: ((body: string) => void) | undefined;
    const unsubscribe = vi.fn();
    vi.spyOn(stompClient, "subscribe").mockImplementation(
      (destination, listener) => {
        expect(destination).toBe("/topic/conversations/10");
        receive = listener;
        return unsubscribe;
      }
    );

    const view = render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionHarness conversationId={10} status="connected" />
      </QueryClientProvider>
    );

    const body = JSON.stringify({
      type: "MESSAGE_CREATED",
      conversationId: 10,
      message: incomingMessage
    });
    act(() => receive?.(body));
    act(() => receive?.(body));

    const data = queryClient.getQueryData<MessageInfiniteData>(
      messageQueryKey(10)
    );
    expect(data?.pages[0].items).toEqual([incomingMessage]);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: CONVERSATIONS_QUERY_KEY
    });

    view.unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("ignores malformed and mismatched events", () => {
    const queryClient = createQueryClient();
    let receive: ((body: string) => void) | undefined;
    vi.spyOn(stompClient, "subscribe").mockImplementation(
      (_destination, listener) => {
        receive = listener;
        return () => undefined;
      }
    );

    render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionHarness conversationId={10} status="connected" />
      </QueryClientProvider>
    );

    act(() => receive?.("not-json"));
    act(() =>
      receive?.(
        JSON.stringify({
          type: "MESSAGE_CREATED",
          conversationId: 99,
          message: incomingMessage
        })
      )
    );

    expect(queryClient.getQueryData(messageQueryKey(10))).toBeUndefined();
  });
});
