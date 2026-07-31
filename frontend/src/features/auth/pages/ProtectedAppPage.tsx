import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogout } from "../hooks/useLogout";
import { authErrorMessage } from "../lib/auth-error";
import { CurrentUserCard } from "../../users/components/CurrentUserCard";
import { UserSearchBox } from "../../users/components/UserSearchBox";

export function ProtectedAppPage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf8] px-4 py-8 text-ink sm:px-6 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-pinglix-200/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-52 -right-32 h-[30rem] w-[30rem] rounded-full bg-emerald-100/80 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-4xl">
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-pinglix-700">
              Pinglix
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Welcome to Pinglix
            </h1>
            <p className="mt-2 font-semibold text-pinglix-700">
              Authentication successful
            </p>
            <p className="mt-1 text-sm text-muted">
              Signed in as {user?.displayName || user?.email}
            </p>
          </div>

          <div>
          {logout.isError ? (
            <p
              role="alert"
                className="mb-3 max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
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
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pinglix-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
          </div>
        </header>

        <div className="grid gap-6">
          <CurrentUserCard />
          <UserSearchBox />
        </div>

        <footer className="mt-8 text-center text-xs text-muted">
          pinglix.in · User module foundation
        </footer>
      </div>
    </main>
  );
}
