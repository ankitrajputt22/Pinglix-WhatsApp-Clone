import type { ReactNode } from "react";

type AuthRouteStateProps = {
  children?: ReactNode;
  error?: Error | null;
  isLoading: boolean;
  onRetry: () => void;
};

export function AuthRouteState({
  children,
  error,
  isLoading,
  onRetry
}: AuthRouteStateProps) {
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4fbf8] px-4 text-ink">
        <div role="status" className="text-center">
          <span
            aria-hidden="true"
            className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-pinglix-100 border-t-pinglix-600"
          />
          <p className="mt-4 font-semibold">Restoring your session...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4fbf8] px-4 text-ink">
        <section
          role="alert"
          className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-card"
        >
          <h1 className="text-xl font-bold">Unable to check your session</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Unable to connect. Please try again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-xl bg-pinglix-700 px-5 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return children;
}
