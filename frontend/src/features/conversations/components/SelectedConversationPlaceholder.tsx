import { Icon } from "../../../components/ui/Icon";
import { MessageComposer } from "../../messages/components/MessageComposer";
import { MessageList } from "../../messages/components/MessageList";
import { RealtimeStatusIndicator } from "../../realtime/components/RealtimeStatusIndicator";
import type { RealtimeConnectionStatus } from "../../realtime/types/realtime.types";
import { UserAvatar } from "../../users/components/UserAvatar";
import { useConversation } from "../hooks/useConversation";

type SelectedConversationPlaceholderProps = {
  conversationId: number | null;
  currentUserId: number | null;
  realtimeStatus: RealtimeConnectionStatus;
  onBack: () => void;
};

export function SelectedConversationPlaceholder({
  conversationId,
  currentUserId,
  realtimeStatus,
  onBack
}: SelectedConversationPlaceholderProps) {
  const conversation = useConversation(conversationId);

  return (
    <section
      aria-labelledby="selected-conversation-title"
      className="flex min-h-0 min-w-0 flex-1 bg-white"
    >
      {conversationId === null ? (
        <div className="pinglix-grid flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-pinglix-200 bg-pinglix-100 text-pinglix-800 shadow-panel">
              <Icon name="chat" className="h-9 w-9" />
            </span>
            <h2
              id="selected-conversation-title"
              className="mt-7 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              Select a conversation to start messaging.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted sm:text-base">
              Choose a recent conversation or search for someone new. Your
              private messages will appear here.
            </p>
          </div>
        </div>
      ) : conversation.isPending ? (
        <div role="status" className="m-auto text-center text-muted">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-pinglix-100 border-t-pinglix-700" />
          <p className="mt-4 text-sm">Opening conversation...</p>
        </div>
      ) : conversation.isError ? (
        <div role="alert" className="m-auto rounded-xl bg-rose-50 p-5 text-center text-sm text-rose-700">
          Unable to open conversation. Please try again.
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 animate-fade-in flex-col">
          <header className="flex min-h-[4.75rem] items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-surface-low hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 lg:hidden"
              aria-label="Back to Conversations"
            >
              <Icon name="arrow-left" className="h-5 w-5" />
            </button>
            <UserAvatar
              displayName={conversation.data.otherParticipant.displayName}
              profileImageUrl={conversation.data.otherParticipant.profileImageUrl}
              size="medium"
            />
            <div className="min-w-0">
              <h2
                id="selected-conversation-title"
                className="truncate text-base font-semibold text-ink"
              >
                {conversation.data.otherParticipant.displayName}
              </h2>
              <p className="truncate text-xs text-muted">
                {conversation.data.otherParticipant.email}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <RealtimeStatusIndicator status={realtimeStatus} compact />
              <span className="hidden rounded-full bg-pinglix-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-pinglix-700 sm:inline-flex">
                Private
              </span>
            </div>
          </header>

          {currentUserId === null ? (
            <div role="status" className="m-auto text-sm text-muted">
              Preparing messages...
            </div>
          ) : (
            <>
              <MessageList
                conversationId={conversationId}
                currentUserId={currentUserId}
              />
              <MessageComposer conversationId={conversationId} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
