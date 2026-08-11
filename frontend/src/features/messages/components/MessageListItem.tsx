import type { MessageResponse } from "../types/message.types";
import { MessageStatusIndicator } from "./MessageStatusIndicator";

type MessageListItemProps = {
  message: MessageResponse;
  isCurrentUser: boolean;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function MessageListItem({
  message,
  isCurrentUser
}: MessageListItemProps) {
  return (
    <li className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[88%] rounded-[1.25rem] px-4 py-2.5 shadow-sm sm:max-w-[72%] ${
          isCurrentUser
            ? "rounded-br-md bg-gradient-to-br from-pinglix-700 to-pinglix-800 text-white"
            : "rounded-bl-md border border-slate-200 bg-white/95 text-ink"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <p
            className={`text-xs font-semibold ${
              isCurrentUser ? "text-pinglix-50" : "text-pinglix-700"
            }`}
          >
            {isCurrentUser ? "You" : message.sender.displayName}
          </p>
          <time
            dateTime={message.createdAt}
            className={`text-[10px] ${
              isCurrentUser ? "text-pinglix-100" : "text-muted"
            }`}
          >
            {formatTime(message.createdAt)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>
        {isCurrentUser ? (
          <div className="mt-1 flex justify-end">
            <MessageStatusIndicator status={message.status} />
          </div>
        ) : null}
      </article>
    </li>
  );
}
