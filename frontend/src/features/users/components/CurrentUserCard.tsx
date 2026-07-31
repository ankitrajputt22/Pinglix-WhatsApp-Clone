import { useCurrentUserProfile } from "../hooks/useCurrentUserProfile";
import { UserAvatar } from "./UserAvatar";

const defaultAbout = "Hey there! I am using Pinglix.";

export function CurrentUserCard() {
  const { data: profile, error, isPending, refetch } =
    useCurrentUserProfile();

  return (
    <section
      aria-labelledby="current-profile-title"
      className="rounded-3xl border border-white/90 bg-white/90 p-6 shadow-card backdrop-blur sm:p-7"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pinglix-700">
          Your profile
        </p>
        <h2
          id="current-profile-title"
          className="mt-1 text-xl font-bold tracking-tight text-ink"
        >
          Current user profile
        </h2>
      </div>

      {isPending ? (
        <div role="status" className="flex items-center gap-3 text-muted">
          <span
            aria-hidden="true"
            className="h-6 w-6 animate-spin rounded-full border-[3px] border-pinglix-100 border-t-pinglix-600"
          />
          <p className="text-sm font-medium">Loading your profile...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl bg-rose-50 p-4">
          <p className="font-semibold text-rose-800">
            Unable to load your profile
          </p>
          <p className="mt-1 text-sm text-rose-700">
            Unable to load users. Please try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <UserAvatar
            displayName={profile.displayName}
            profileImageUrl={profile.profileImageUrl}
            size="large"
          />
          <dl className="min-w-0 flex-1">
            <div>
              <dt className="sr-only">Display name</dt>
              <dd className="truncate text-lg font-bold text-ink">
                {profile.displayName}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Email</dt>
              <dd className="mt-0.5 break-all text-sm text-muted">
                {profile.email}
              </dd>
            </div>
            <div>
              <dt className="sr-only">About</dt>
              <dd className="mt-3 text-sm leading-6 text-ink/80">
                {profile.about || defaultAbout}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
