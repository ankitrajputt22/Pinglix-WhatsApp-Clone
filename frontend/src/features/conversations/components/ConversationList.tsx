import { Icon } from "../../../components/ui/Icon";
import { useConversations } from "../hooks/useConversations";
import { ConversationListItem } from "./ConversationListItem";

type ConversationListProps = {
  selectedConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
};

export function ConversationList({
  selectedConversationId,
  onSelectConversation
}: ConversationListProps) {
  const conversations = useConversations();

  return (
    <section
      aria-labelledby="recent-conversations-title"
      className="flex min-h-72 flex-1 flex-col bg-white px-4 py-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2
            id="recent-conversations-title"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted"
          >
            Recent Conversations
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void conversations.refetch()}
          disabled={conversations.isFetching}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-muted transition hover:border-pinglix-200 hover:bg-pinglix-50 hover:text-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <Icon
            name="refresh"
            className={`h-3.5 w-3.5 ${
              conversations.isFetching ? "animate-spin" : ""
            }`}
          />
          {conversations.isFetching ? "Refreshing..." : "Refresh Conversations"}
        </button>
      </div>

      {conversations.isPending ? (
        <div role="status" className="flex items-center gap-3 py-5 text-muted">
          <span
            aria-hidden="true"
            className="h-6 w-6 animate-spin rounded-full border-[3px] border-pinglix-100 border-t-pinglix-600"
          />
          <p className="text-sm font-medium">Loading conversations...</p>
        </div>
      ) : conversations.isError ? (
        <div role="alert" className="rounded-xl bg-rose-50 p-4">
          <p className="font-semibold text-rose-800">
            Unable to load conversations. Please try again.
          </p>
        </div>
      ) : conversations.data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-surface/70 px-5 py-8 text-center">
          <Icon name="chat" className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm leading-6 text-muted">
            No conversations yet. Search for users to start one.
          </p>
        </div>
      ) : (
        <ul aria-label="Recent conversations" className="space-y-1.5">
          {conversations.data.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onSelectConversation}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
