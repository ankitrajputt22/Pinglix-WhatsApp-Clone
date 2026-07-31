import { type FormEvent, useState } from "react";

import { useUserSearch } from "../hooks/useUserSearch";
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

export function UserSearchBox() {
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
      className="rounded-3xl border border-white/90 bg-white/90 p-6 shadow-card backdrop-blur sm:p-7"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pinglix-700">
          Discover people
        </p>
        <h2
          id="user-search-title"
          className="mt-1 text-xl font-bold tracking-tight text-ink"
        >
          Search registered users
        </h2>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <label
          htmlFor="user-search"
          className="mb-2 block text-sm font-semibold text-ink"
        >
          Search users
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="user-search"
            type="search"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder="Search by name or email"
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError ? "user-search-error" : undefined
            }
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-pinglix-500 focus:ring-4 focus:ring-pinglix-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-100"
          />
          <button
            type="submit"
            disabled={!canSearch}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-pinglix-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
          >
            {search.isFetching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={clearSearch}
            disabled={!canClear}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-950/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-pinglix-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Clear Search
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

      <div className="mt-4" aria-live="polite">
        <UserSearchResults
          query={submittedQuery}
          results={search.data}
          isLoading={search.isPending || search.isFetching}
          isError={search.isError}
        />
      </div>
    </section>
  );
}
