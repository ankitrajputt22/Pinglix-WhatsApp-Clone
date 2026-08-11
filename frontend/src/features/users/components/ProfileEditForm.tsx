import { useEffect, useState } from "react";

import { ApiClientError } from "../../../lib/api-client";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import type { UserProfile } from "../types/user.types";

type ProfileEditFormProps = {
  profile: UserProfile;
  onCancel: () => void;
  onSaved: () => void;
};

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError && error.kind === "HTTP") {
    return error.message;
  }
  return "Unable to update your profile. Please try again.";
}

export function ProfileEditForm({
  profile,
  onCancel,
  onSaved
}: ProfileEditFormProps) {
  const update = useUpdateProfile();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [about, setAbout] = useState(profile.about ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    profile.profileImageUrl ?? ""
  );
  const trimmedName = displayName.trim();
  const canSave = trimmedName.length >= 2 && trimmedName.length <= 50
    && about.length <= 255 && profileImageUrl.length <= 500
    && !update.isPending;

  useEffect(() => {
    setDisplayName(profile.displayName);
    setAbout(profile.about ?? "");
    setProfileImageUrl(profile.profileImageUrl ?? "");
  }, [profile]);

  function submit() {
    if (!canSave) {
      return;
    }
    update.mutate(
      {
        displayName: trimmedName,
        about: about.trim(),
        profileImageUrl: profileImageUrl.trim()
      },
      { onSuccess: onSaved }
    );
  }

  return (
    <form
      aria-label="Edit profile"
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div>
        <label htmlFor="profile-display-name" className="text-xs font-semibold text-muted">
          Display name
        </label>
        <input
          id="profile-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={50}
          required
          className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-surface-low px-3 text-sm text-ink outline-none focus:border-pinglix-500 focus:ring-4 focus:ring-pinglix-100"
        />
      </div>
      <div>
        <label htmlFor="profile-about" className="text-xs font-semibold text-muted">
          About
        </label>
        <textarea
          id="profile-about"
          value={about}
          onChange={(event) => setAbout(event.target.value)}
          maxLength={255}
          rows={2}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-surface-low px-3 py-2 text-sm text-ink outline-none focus:border-pinglix-500 focus:ring-4 focus:ring-pinglix-100"
        />
      </div>
      <div>
        <label htmlFor="profile-image-url" className="text-xs font-semibold text-muted">
          Profile image URL
        </label>
        <input
          id="profile-image-url"
          type="url"
          value={profileImageUrl}
          onChange={(event) => setProfileImageUrl(event.target.value)}
          maxLength={500}
          placeholder="https://example.com/avatar.jpg"
          className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-surface-low px-3 text-sm text-ink outline-none focus:border-pinglix-500 focus:ring-4 focus:ring-pinglix-100"
        />
      </div>
      {update.isError ? (
        <p role="alert" className="text-xs text-rose-700">
          {errorMessage(update.error)}
        </p>
      ) : null}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSave}
          className="min-h-10 flex-1 rounded-xl bg-pinglix-700 px-3 text-sm font-semibold text-white transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {update.isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-muted transition hover:bg-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
