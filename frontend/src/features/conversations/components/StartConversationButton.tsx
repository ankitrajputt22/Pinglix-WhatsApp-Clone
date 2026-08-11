import { ApiClientError } from "../../../lib/api-client";
import { useCreatePrivateConversation } from "../hooks/useCreatePrivateConversation";
import type { ConversationResponse } from "../types/conversation.types";

type StartConversationButtonProps = {
  targetUserId: number;
  targetDisplayName: string;
  onConversationStarted: (conversation: ConversationResponse) => void;
};

function errorMessage(error: unknown) {
  if (
    error instanceof ApiClientError &&
    error.kind === "HTTP" &&
    (error.status ?? 500) < 500
  ) {
    return error.message;
  }

  return "Unable to start conversation. Please try again.";
}

export function StartConversationButton({
  targetUserId,
  targetDisplayName,
  onConversationStarted
}: StartConversationButtonProps) {
  const createConversation = useCreatePrivateConversation();

  return (
    <div className="mt-2 sm:mt-0 sm:text-right">
      <button
        type="button"
        onClick={() =>
          createConversation.mutate(targetUserId, {
            onSuccess: onConversationStarted
          })
        }
        disabled={createConversation.isPending}
        aria-label={`Start conversation with ${targetDisplayName}`}
        className="inline-flex min-h-9 w-full items-center justify-center rounded-full bg-pinglix-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300 sm:w-auto"
      >
        {createConversation.isPending ? "Starting..." : "Start Conversation"}
      </button>

      <div aria-live="polite" className="mt-2 text-sm">
        {createConversation.isSuccess ? (
          <p className="text-pinglix-700">
            Conversation ready with {targetDisplayName}.
          </p>
        ) : null}
        {createConversation.isError ? (
          <p role="alert" className="text-rose-700">
            {errorMessage(createConversation.error)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
