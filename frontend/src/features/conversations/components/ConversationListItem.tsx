import type { ConversationResponse } from "../types/conversation.types";
import { UserAvatar } from "../../users/components/UserAvatar";

type ConversationListItemProps = {
  conversation: ConversationResponse;
  isSelected: boolean;
  onSelect: (conversationId: number) => void;
};

function formatTimestamp(value: string) {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - timestamp.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60_000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (hours < 48) {
    return "Yesterday";
  }

  return timestamp.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect
}: ConversationListItemProps) {
  const participant = conversation.otherParticipant;
  const activityTimestamp = conversation.lastMessageAt ?? conversation.updatedAt;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-pressed={isSelected}
        className={`group w-full rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 ${
          isSelected
            ? "border-pinglix-200 bg-pinglix-50 shadow-sm"
            : "border-transparent bg-white hover:border-slate-200 hover:bg-surface-low"
        }`}
      >
        <span className="flex items-center gap-3">
          <UserAvatar
            displayName={participant.displayName}
            profileImageUrl={participant.profileImageUrl}
            size="medium"
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-3">
              <span className="truncate text-sm font-semibold text-ink">
                {participant.displayName}
              </span>
              <span className="shrink-0 text-[10px] text-muted">
                {formatTimestamp(activityTimestamp)}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted">
              {participant.email}
            </span>
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-pinglix-700">
                {conversation.lastMessageAt
                  ? "Open to view messages."
                  : "No messages yet."}
              </span>
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-[9px] font-bold tracking-wide text-muted group-aria-[pressed=true]:bg-white group-aria-[pressed=true]:text-pinglix-700">
                {conversation.conversationType}
              </span>
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
