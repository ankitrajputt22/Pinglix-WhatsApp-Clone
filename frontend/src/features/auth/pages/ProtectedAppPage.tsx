import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogout } from "../hooks/useLogout";
import { authErrorMessage } from "../lib/auth-error";

export function ProtectedAppPage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf8] px-4 py-10 text-ink sm:px-6">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-pinglix-200/45 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl border border-white/90 bg-white/90 p-7 text-center shadow-card backdrop-blur sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pinglix-100 text-2xl font-bold text-pinglix-700">
            ✓
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Welcome to Pinglix
          </h1>
          <p className="mt-3 text-lg font-semibold text-pinglix-700">
            Authentication successful
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Signed in as{" "}
            <span className="font-semibold text-ink">
              {user?.displayName || user?.email}
            </span>
          </p>

          {logout.isError ? (
            <p
              role="alert"
              className="mx-auto mt-5 max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {authErrorMessage(
                logout.error,
                "Unable to contact the server. You have been signed out locally."
              )}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-pinglix-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </section>
      </div>
    </main>
  );
}
