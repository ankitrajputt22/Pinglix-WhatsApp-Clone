import type { UserSearchResult } from "../types/user.types";
import { UserAvatar } from "./UserAvatar";

type UserSearchResultsProps = {
  query: string;
  results?: UserSearchResult[];
  isLoading: boolean;
  isError: boolean;
};

export function UserSearchResults({
  query,
  results,
  isLoading,
  isError
}: UserSearchResultsProps) {
  if (!query) {
    return (
      <div className="rounded-2xl border border-dashed border-pinglix-200 bg-pinglix-50/50 px-5 py-8 text-center">
        <p className="text-sm leading-6 text-muted">
          Search for users to start connecting on Pinglix.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div role="status" className="flex items-center gap-3 py-6 text-muted">
        <span
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-[3px] border-pinglix-100 border-t-pinglix-600"
        />
        <p className="text-sm font-medium">Searching users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-2xl bg-rose-50 px-5 py-4">
        <p className="font-semibold text-rose-800">
          Unable to search users
        </p>
        <p className="mt-1 text-sm text-rose-700">
          Unable to load users. Please try again.
        </p>
      </div>
    );
  }

  if (!results?.length) {
    return (
      <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">
        <p className="font-semibold text-ink">No users found</p>
        <p className="mt-1 text-sm text-muted">
          Try another display name or email.
        </p>
      </div>
    );
  }

  return (
    <ul aria-label="User search results" className="space-y-3">
      {results.map((user) => (
        <li
          key={user.id}
          className="flex items-start gap-3 rounded-2xl border border-emerald-950/10 bg-white p-4"
        >
          <UserAvatar
            displayName={user.displayName}
            profileImageUrl={user.profileImageUrl}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{user.displayName}</p>
            <p className="break-all text-sm text-muted">{user.email}</p>
            {user.about ? (
              <p className="mt-2 text-sm leading-5 text-ink/75">
                {user.about}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
