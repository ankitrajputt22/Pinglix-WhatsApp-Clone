type LoadOlderMessagesButtonProps = {
  isLoading: boolean;
  onLoad: () => void;
};

export function LoadOlderMessagesButton({
  isLoading,
  onLoad
}: LoadOlderMessagesButtonProps) {
  return (
    <button
      type="button"
      onClick={onLoad}
      disabled={isLoading}
      className="mx-auto inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-pinglix-700 transition hover:border-pinglix-200 hover:bg-pinglix-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:text-muted"
    >
      {isLoading ? "Loading older messages..." : "Load Older Messages"}
    </button>
  );
}
