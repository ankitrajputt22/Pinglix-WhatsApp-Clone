import { type FormEvent, type ReactNode, useState } from "react";

import { Icon } from "../../../components/ui/Icon";
import { useUserSearch } from "../hooks/useUserSearch";
import type { UserSearchResult } from "../types/user.types";
import { UserSearchResults } from "./UserSearchResults";

function validateQuery(value: string) {
  const query = value.trim();

  if (query.length > 0 && query.length < 2) {
    return "Enter at least 2 characters to search";
  }

  if (query.length > 100) {
    return "Search must be at most 100 characters";
  }

  return undefined;
}

type UserSearchBoxProps = {
  renderUserAction?: (user: UserSearchResult) => ReactNode;
};

export function UserSearchBox({
  renderUserAction
}: UserSearchBoxProps) {
  const [input, setInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const search = useUserSearch(submittedQuery);
  const normalizedInput = input.trim();
  const canSearch =
    normalizedInput.length >= 2 &&
    normalizedInput.length <= 100 &&
    !search.isFetching;
  const canClear = input.length > 0 || submittedQuery.length > 0;

  function handleInputChange(value: string) {
    setInput(value);
    setValidationError(validateQuery(value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateQuery(input);

    if (error || normalizedInput.length === 0) {
      setValidationError(
        error ?? "Enter at least 2 characters to search"
      );
      return;
    }

    setValidationError(undefined);

    if (normalizedInput === submittedQuery) {
      void search.refetch();
    } else {
      setSubmittedQuery(normalizedInput);
    }
  }

  function clearSearch() {
    setInput("");
    setSubmittedQuery("");
    setValidationError(undefined);
  }

  return (
    <section
      aria-labelledby="user-search-title"
      className="border-b border-slate-200 bg-white px-5 py-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="user-search-title"
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted"
        >
          Find people
        </h2>
        <span className="text-[11px] font-medium text-pinglix-700">
          Private conversations only
        </span>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <label
          htmlFor="user-search"
          className="sr-only"
        >
          Search users
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            />
            <input
              id="user-search"
              type="search"
              value={input}
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder="Search by name or email..."
              maxLength={100}
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? "user-search-error" : undefined
              }
              className="min-h-11 w-full rounded-xl border border-transparent bg-surface-low py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-500 hover:bg-surface-container focus:border-pinglix-600 focus:bg-white focus:ring-4 focus:ring-pinglix-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-100"
            />
          </div>
          <button
            type="submit"
            disabled={!canSearch}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-pinglix-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
          >
            {search.isFetching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={clearSearch}
            disabled={!canClear}
            aria-label="Clear Search"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-muted transition hover:bg-surface-low hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p
          id="user-search-error"
          aria-live="polite"
          className="mt-2 min-h-5 text-sm text-rose-700"
        >
          {validationError}
        </p>
      </form>

      <div className="mt-1" aria-live="polite">
        <UserSearchResults
          query={submittedQuery}
          results={search.data}
          isLoading={search.isPending || search.isFetching}
          isError={search.isError}
          renderUserAction={renderUserAction}
        />
      </div>
    </section>
  );
}
