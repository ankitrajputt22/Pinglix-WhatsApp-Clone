import { useState } from "react";

import { useCurrentUserProfile } from "../hooks/useCurrentUserProfile";
import { ProfileEditForm } from "./ProfileEditForm";
import { UserAvatar } from "./UserAvatar";

const defaultAbout = "Hey there! I am using Pinglix.";

export function CurrentUserCard() {
  const [editing, setEditing] = useState(false);
  const { data: profile, error, isPending, refetch } =
    useCurrentUserProfile();

  return (
    <section
      aria-labelledby="current-profile-title"
      className="border-b border-slate-200 bg-white px-5 py-4"
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
        Your profile
      </p>
      <h2 id="current-profile-title" className="sr-only">
        Current user profile
      </h2>

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
            Unable to load your profile. Please try again.
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
        <>
          {editing ? (
            <ProfileEditForm
              profile={profile}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <div className="flex items-center gap-3">
              <UserAvatar
                displayName={profile.displayName}
                profileImageUrl={profile.profileImageUrl}
                size="medium"
              />
              <dl className="min-w-0 flex-1">
                <div>
                  <dt className="sr-only">Display name</dt>
                  <dd className="truncate text-sm font-semibold text-ink">
                    {profile.displayName}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd className="mt-0.5 truncate text-xs text-muted">
                    {profile.email}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">About</dt>
                  <dd className="mt-1 truncate text-xs leading-5 text-ink/70">
                    {profile.about || defaultAbout}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-pinglix-700 transition hover:bg-pinglix-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
              >
                Edit Profile
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
