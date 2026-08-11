import type { InfiniteData } from "@tanstack/react-query";

import type {
  MessagePageResponse,
  MessageResponse,
  MessageStatus
} from "../../messages/types/message.types";

export type MessageInfiniteData = InfiniteData<
  MessagePageResponse,
  number | undefined
>;

function isDuplicate(
  current: MessageInfiniteData,
  incoming: MessageResponse
) {
  return current.pages.some((page) =>
    page.items.some(
      (message) =>
        message.id === incoming.id ||
        message.clientMessageId === incoming.clientMessageId
    )
  );
}

export function addRealtimeMessage(
  current: MessageInfiniteData | undefined,
  incoming: MessageResponse
): MessageInfiniteData {
  if (!current || current.pages.length === 0) {
    return {
      pages: [
        {
          items: [incoming],
          nextBeforeMessageId: null,
          hasMore: false
        }
      ],
      pageParams: [undefined]
    };
  }

  if (isDuplicate(current, incoming)) {
    return current;
  }

  return {
    ...current,
    pages: current.pages.map((page, index) =>
      index === 0
        ? { ...page, items: [...page.items, incoming] }
        : page
    )
  };
}

export function updateRealtimeMessageStatuses(
  current: MessageInfiniteData | undefined,
  messageIds: number[],
  status: MessageStatus
): MessageInfiniteData | undefined {
  if (!current || messageIds.length === 0) {
    return current;
  }
  const ids = new Set(messageIds);
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((message) =>
        ids.has(message.id) ? { ...message, status } : message
      )
    }))
  };
}
