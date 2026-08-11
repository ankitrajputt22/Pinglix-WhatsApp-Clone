import type { ReactNode } from "react";

import { Icon } from "../../../components/ui/Icon";
import type { UserSearchResult } from "../types/user.types";
import { UserAvatar } from "./UserAvatar";

type UserSearchResultsProps = {
  query: string;
  results?: UserSearchResult[];
  isLoading: boolean;
  isError: boolean;
  renderUserAction?: (user: UserSearchResult) => ReactNode;
};

export function UserSearchResults({
  query,
  results,
  isLoading,
  isError,
  renderUserAction
}: UserSearchResultsProps) {
  if (!query) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-low px-3 py-3">
        <Icon
          name="users"
          className="h-5 w-5 shrink-0 text-pinglix-600"
        />
        <p className="text-xs leading-5 text-muted">
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
        <p className="text-sm font-medium">Searching...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3">
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
      <div className="rounded-xl bg-surface-low px-4 py-6 text-center">
        <p className="font-semibold text-ink">No users found.</p>
        <p className="mt-1 text-sm text-muted">
          Try another display name or email.
        </p>
      </div>
    );
  }

  return (
    <ul aria-label="User search results" className="space-y-2">
      {results.map((user) => (
        <li
          key={user.id}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-pinglix-200"
        >
          <div className="flex min-w-0 items-start gap-3">
            <UserAvatar
              displayName={user.displayName}
              profileImageUrl={user.profileImageUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{user.displayName}</p>
              <p className="break-all text-xs text-muted">{user.email}</p>
              {user.about ? (
                <p className="mt-1 text-xs leading-5 text-ink/75">
                  {user.about}
                </p>
              ) : null}
            </div>
          </div>
          {renderUserAction?.(user)}
        </li>
      ))}
    </ul>
  );
}
