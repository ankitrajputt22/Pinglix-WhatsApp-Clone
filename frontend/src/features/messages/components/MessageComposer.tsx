import { type KeyboardEvent, useRef, useState } from "react";

import { Icon } from "../../../components/ui/Icon";
import { ApiClientError } from "../../../lib/api-client";
import { useSendMessage } from "../hooks/useSendMessage";

type MessageComposerProps = {
  conversationId: number;
};

function sendErrorMessage(error: unknown) {
  if (
    error instanceof ApiClientError &&
    error.kind === "HTTP" &&
    (error.status ?? 500) < 500
  ) {
    return error.message;
  }
  return "Unable to send message. Please try again.";
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const clientMessageIdRef = useRef<string | null>(null);
  const send = useSendMessage();
  const trimmed = content.trim();
  const isTooLong = trimmed.length > 4000;
  const canSend = trimmed.length > 0 && !isTooLong && !send.isPending;

  function submit() {
    if (!canSend) {
      return;
    }

    clientMessageIdRef.current ??= globalThis.crypto.randomUUID();
    send.mutate(
      {
        conversationId,
        payload: {
          clientMessageId: clientMessageIdRef.current,
          content
        }
      },
      {
        onSuccess: () => {
          setContent("");
          clientMessageIdRef.current = null;
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <section
      aria-label="Message composer"
      className="border-t border-slate-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-4 sm:pt-4"
    >
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="message-content" className="sr-only">
            Message
          </label>
          <textarea
            ref={inputRef}
            id="message-content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              clientMessageIdRef.current = null;
              if (send.isError) {
                send.reset();
              }
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={4100}
            placeholder="Type a message"
            className="block max-h-32 min-h-12 w-full resize-none rounded-2xl border border-slate-200 bg-surface-low px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-pinglix-500 focus:bg-white focus:ring-4 focus:ring-pinglix-100"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-pinglix-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300 disabled:shadow-none sm:px-5"
        >
          {send.isPending ? (
            "Sending..."
          ) : (
            <>
              Send
              <Icon name="arrow-right" className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div aria-live="polite" className="mt-2 min-h-5 text-xs">
        {isTooLong ? (
          <p role="alert" className="text-rose-700">
            Message must be at most 4000 characters
          </p>
        ) : send.isError ? (
          <p role="alert" className="text-rose-700">
            {sendErrorMessage(send.error)}
          </p>
        ) : send.isSuccess ? (
          <p className="text-pinglix-700">Message sent.</p>
        ) : (
          <div className="flex items-center justify-between gap-3 text-muted">
            <p>Enter to send · Shift+Enter for a new line</p>
            <p>{trimmed.length}/4000</p>
          </div>
        )}
      </div>
    </section>
  );
}
