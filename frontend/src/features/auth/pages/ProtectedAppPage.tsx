import { useState } from "react";
import { Link } from "react-router-dom";

import { BrandMark } from "../../../components/ui/BrandMark";
import { Icon } from "../../../components/ui/Icon";
import { ConversationList } from "../../conversations/components/ConversationList";
import { SelectedConversationPlaceholder } from "../../conversations/components/SelectedConversationPlaceholder";
import { StartConversationButton } from "../../conversations/components/StartConversationButton";
import { RealtimeStatusIndicator } from "../../realtime/components/RealtimeStatusIndicator";
import { useConversationMessagesSubscription } from "../../realtime/hooks/useConversationMessagesSubscription";
import { useRealtimeConnection } from "../../realtime/hooks/useRealtimeConnection";
import { CurrentUserCard } from "../../users/components/CurrentUserCard";
import { UserAvatar } from "../../users/components/UserAvatar";
import { UserSearchBox } from "../../users/components/UserSearchBox";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogout } from "../hooks/useLogout";
import { authErrorMessage } from "../lib/auth-error";

export function ProtectedAppPage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const realtime = useRealtimeConnection(Boolean(user));
  const hasSelectedConversation = selectedConversationId !== null;

  useConversationMessagesSubscription(
    selectedConversationId,
    realtime.status,
    user?.id ?? null
  );

  function focusUserSearch() {
    setSelectedConversationId(null);
    const search = document.getElementById("user-search");
    search?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    search?.focus();
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-surface text-ink lg:h-svh lg:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl lg:static">
        <div className="mx-auto flex h-[4.5rem] max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <BrandMark />
          <p className="hidden border-l border-slate-200 pl-4 text-xs font-medium text-muted xl:block">
            Real-time conversations, instantly connected.
          </p>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            {!hasSelectedConversation ? (
              <RealtimeStatusIndicator status={realtime.status} compact />
            ) : null}
            <Link
              to="/health"
              aria-label="Open system status"
              className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted transition hover:bg-surface-low hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 sm:inline-flex"
            >
              <Icon name="health" className="h-4 w-4" />
              System status
            </Link>
            <div className="hidden min-w-0 text-right md:block">
              <p className="max-w-40 truncate text-sm font-semibold text-ink">
                {user?.displayName || "Pinglix user"}
              </p>
              <p className="max-w-40 truncate text-[11px] text-muted">
                {user?.email || "Active account"}
              </p>
            </div>
            <UserAvatar
              displayName={user?.displayName || user?.email || "Pinglix user"}
              profileImageUrl={user?.profileImageUrl ?? null}
            />
            <button
              type="button"
              aria-label={logout.isPending ? "Logging out..." : "Logout"}
              onClick={() => {
                void realtime.disconnect();
                logout.mutate();
              }}
              disabled={logout.isPending}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">
                {logout.isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {logout.isError ? (
        <p
          role="alert"
          className="mx-auto mt-3 max-w-[1500px] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {authErrorMessage(
            logout.error,
            "Unable to contact the server. You have been signed out locally."
          )}
        </p>
      ) : null}

      <div className="mx-auto min-h-[calc(100svh-4.5rem)] max-w-[1500px] p-0 md:p-4 lg:h-[calc(100vh-4.5rem)] lg:min-h-0 lg:p-5">
        <div className="h-full overflow-hidden bg-white md:rounded-[1.5rem] md:border md:border-slate-200 md:shadow-card lg:grid lg:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
          <aside
            aria-label="Conversation navigation"
            className={`${
              hasSelectedConversation ? "hidden lg:flex" : "flex"
            } min-h-[calc(100svh-4.5rem)] flex-col bg-white lg:min-h-0 lg:border-r lg:border-slate-200`}
          >
            <div className="border-b border-slate-200 bg-gradient-to-br from-pinglix-50 via-white to-blue-50 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pinglix-700">
                    Private messages
                  </p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                    Welcome to Pinglix
                  </h1>
                  <p className="mt-1 text-sm leading-5 text-muted">
                    Find a person and continue the conversation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={focusUserSearch}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-pinglix-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
                >
                  <Icon name="plus-chat" className="h-4 w-4" />
                  New chat
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <CurrentUserCard />
              <UserSearchBox
                renderUserAction={(targetUser) => (
                  <StartConversationButton
                    targetUserId={targetUser.id}
                    targetDisplayName={targetUser.displayName}
                    onConversationStarted={(conversation) =>
                      setSelectedConversationId(conversation.id)
                    }
                  />
                )}
              />
              <ConversationList
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
              />
            </div>
          </aside>

          <section
            aria-label="Active conversation"
            className={`${
              hasSelectedConversation ? "flex" : "hidden lg:flex"
            } min-h-[calc(100svh-4.5rem)] min-w-0 bg-white lg:min-h-0`}
          >
            <SelectedConversationPlaceholder
              conversationId={selectedConversationId}
              currentUserId={user?.id ?? null}
              realtimeStatus={realtime.status}
              onBack={() => setSelectedConversationId(null)}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
