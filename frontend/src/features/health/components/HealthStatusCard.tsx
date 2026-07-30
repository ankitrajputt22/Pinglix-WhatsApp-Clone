import { useHealthCheck } from "../hooks/useHealthCheck";

function displayTimestamp(timestamp?: string) {
  if (!timestamp) {
    return undefined;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function HealthStatusCard() {
  const { data, error, isError, isFetching, isPending, refetch } =
    useHealthCheck();
  const checkedAt = displayTimestamp(data?.timestamp);

  return (
    <section
      aria-labelledby="health-status-title"
      className="overflow-hidden rounded-3xl border border-white/90 bg-white/90 shadow-card backdrop-blur"
    >
      <div className="border-b border-emerald-950/5 px-5 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              System status
            </p>
            <h2
              id="health-status-title"
              className="mt-1 text-xl font-semibold tracking-tight text-ink"
            >
              Backend health check
            </h2>
          </div>
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-full ${
              isPending
                ? "animate-pulse bg-amber-400"
                : isError
                  ? "bg-rose-500"
                  : "bg-pinglix-500"
            }`}
          />
        </div>
      </div>

      <div aria-live="polite" className="px-5 py-7 sm:px-7 sm:py-8">
        {isPending ? (
          <div role="status" className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-pinglix-100 border-t-pinglix-600"
            />
            <div>
              <p className="font-semibold text-ink">
                Checking backend connection...
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Pinglix is waiting for a response from the health endpoint.
              </p>
            </div>
          </div>
        ) : isError ? (
          <div role="alert" className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700"
            >
              !
            </span>
            <div>
              <p className="font-semibold text-rose-800">
                Backend connection unavailable
              </p>
              <p className="mt-1 text-sm leading-6 text-rose-700">
                {error instanceof Error
                  ? error.message
                  : "Backend connection failed. Please try again."}
              </p>
            </div>
          </div>
        ) : (
          <div role="status">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pinglix-100 text-sm font-bold text-pinglix-700"
              >
                ✓
              </span>
              <div>
                <p className="text-lg font-semibold text-pinglix-800">
                  Backend connection successful
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {data.message ?? "The Pinglix backend is ready."}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 rounded-2xl bg-pinglix-50/70 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Application
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {data.application}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Status
                </dt>
                <dd className="mt-1 font-semibold text-pinglix-700">
                  {data.status}
                </dd>
              </div>
              {checkedAt ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Backend timestamp
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{checkedAt}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-emerald-950/5 bg-emerald-50/30 px-5 py-4 sm:px-7">
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pinglix-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
        >
          {isFetching ? "Checking..." : "Retry Connection"}
        </button>
      </div>
    </section>
  );
}
