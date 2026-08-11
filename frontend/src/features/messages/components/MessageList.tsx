import { useEffect, useMemo, useRef } from "react";

import { useMarkMessagesDelivered } from "../hooks/useMarkMessagesDelivered";
import { useMarkMessagesRead } from "../hooks/useMarkMessagesRead";
import { useMessages } from "../hooks/useMessages";
import { LoadOlderMessagesButton } from "./LoadOlderMessagesButton";
import { MessageListItem } from "./MessageListItem";

type MessageListProps = {
  conversationId: number;
  currentUserId: number;
};

export function MessageList({
  conversationId,
  currentUserId
}: MessageListProps) {
  const messages = useMessages(conversationId);
  const items = useMemo(
    () =>
      messages.data?.pages
        .slice()
        .reverse()
        .flatMap((page) => page.items) ?? [],
    [messages.data]
  );
  const deliveredIds = useRef(new Set<number>());
  const readIds = useRef(new Set<number>());
  const markDelivered = useMarkMessagesDelivered();
  const markRead = useMarkMessagesRead();

  useEffect(() => {
    const incoming = items.filter(
      (message) => message.sender.id !== currentUserId
    );
    const toDeliver = incoming
      .filter(
        (message) =>
          message.status === "SENT" && !deliveredIds.current.has(message.id)
      )
      .map((message) => message.id);
    const toRead = incoming
      .filter(
        (message) =>
          message.status !== "READ" && !readIds.current.has(message.id)
      )
      .map((message) => message.id);

    if (toDeliver.length > 0) {
      toDeliver.forEach((id) => deliveredIds.current.add(id));
      void markDelivered
        .mutateAsync({ conversationId, messageIds: toDeliver })
        .catch(() => undefined);
    }
    if (toRead.length > 0) {
      toRead.forEach((id) => readIds.current.add(id));
      void markRead
        .mutateAsync({ conversationId, messageIds: toRead })
        .catch(() => undefined);
    }
  }, [conversationId, currentUserId, items, markDelivered, markRead]);

  return (
    <section
      aria-labelledby="message-history-title"
      className="pinglix-message-surface flex min-h-0 flex-1 flex-col"
    >
      <h2 id="message-history-title" className="sr-only">
        Messages
      </h2>

      {messages.isPending ? (
        <div
          role="status"
          className="flex flex-1 items-center justify-center gap-3 p-8 text-sm text-muted"
        >
          <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-pinglix-100 border-t-pinglix-700" />
          Loading messages...
        </div>
      ) : messages.isError ? (
        <div
          role="alert"
          className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700"
        >
          <p>Unable to load messages. Please try again.</p>
          <button
            type="button"
            onClick={() => void messages.refetch()}
            className="mt-3 min-h-10 rounded-lg border border-rose-200 bg-white px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          >
            Retry Messages
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-5 sm:px-6 sm:py-6">
          {messages.hasNextPage ? (
            <div className="mb-5 flex justify-center">
              <LoadOlderMessagesButton
                isLoading={messages.isFetchingNextPage}
                onLoad={() => void messages.fetchNextPage()}
              />
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-8">
                <p className="font-semibold text-ink">No messages yet.</p>
                <p className="mt-1 text-sm text-muted">
                  Send the first message.
                </p>
              </div>
            </div>
          ) : (
            <ul aria-label="Message history" className="mt-auto space-y-2.5">
              {items.map((message) => (
                <MessageListItem
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender.id === currentUserId}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
