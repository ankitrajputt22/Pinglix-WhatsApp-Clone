import { Icon } from "../../../components/ui/Icon";
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
    <section aria-labelledby="health-status-title" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Current status
            </p>
            <h2
              id="health-status-title"
              className="mt-1 text-xl font-semibold tracking-tight text-ink"
            >
              Core backend foundation
            </h2>
          </div>
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-full ${
              isPending
                ? "animate-pulse bg-amber-400"
                : isError
                  ? "bg-rose-500"
                  : "bg-pinglix-600"
            }`}
          />
        </div>

        <div aria-live="polite" className="px-5 py-7 sm:px-7 sm:py-8">
          {isPending ? (
            <div role="status" className="flex min-h-52 flex-col items-center justify-center text-center">
              <span
                aria-hidden="true"
                className="h-11 w-11 animate-spin rounded-full border-4 border-pinglix-100 border-t-pinglix-700"
              />
              <p className="mt-5 font-semibold text-ink">
                Checking backend connection...
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Pinglix is waiting for the public health endpoint.
              </p>
            </div>
          ) : isError ? (
            <div role="alert" className="flex min-h-52 flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Icon name="alert" className="h-9 w-9" />
              </span>
              <p className="mt-5 text-lg font-semibold text-rose-800">
                Backend connection unavailable
              </p>
              <p className="mt-1 max-w-lg text-sm leading-6 text-rose-700">
                {error instanceof Error
                  ? error.message
                  : "Backend connection failed. Please try again."}
              </p>
            </div>
          ) : (
            <div role="status" className="animate-fade-in">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-pinglix-100 text-pinglix-800">
                  <Icon name="health" className="h-9 w-9" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-5xl font-bold tracking-[-0.05em] text-pinglix-700">
                      {data.status}
                    </span>
                    <span className="h-3.5 w-3.5 rounded-full bg-pinglix-600 shadow-[0_0_0_6px_rgb(169_233_222_/_0.55)]" />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    Backend connection successful
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {data.message ?? "The Pinglix backend is ready."}
                  </p>
                </div>
              </div>

              <dl className="mt-7 grid gap-3 border-t border-slate-200 pt-6 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-surface-low p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    Application
                  </dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {data.app || data.application || "Pinglix"}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface-low p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    API status
                  </dt>
                  <dd className="mt-1 font-semibold text-pinglix-700">
                    Connected
                  </dd>
                </div>
                <div className="rounded-xl bg-surface-low p-4">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                    Last heartbeat
                  </dt>
                  <dd className="mt-1 font-medium text-ink">
                    {checkedAt ?? "Just now"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-300 bg-surface-high p-5 shadow-panel sm:p-6">
        <div className="flex items-center gap-3">
          <Icon name="shield" className="h-6 w-6 text-pinglix-700" />
          <h3 className="text-lg font-semibold text-ink">Foundation check</h3>
        </div>

        <ul className="mt-6 space-y-4">
          {[
            ["Frontend client", "React application loaded"],
            ["Backend API", isError ? "Connection unavailable" : "Health route configured"],
            ["Secure session", "HttpOnly cookie support"],
            ["Database schema", "Flyway-managed migrations"]
          ].map(([title, detail]) => (
            <li key={title} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isError && title === "Backend API"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-pinglix-700 text-white"
                }`}
              >
                <Icon
                  name={isError && title === "Backend API" ? "alert" : "check"}
                  className="h-4 w-4"
                />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {title}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-pinglix-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinglix-600 disabled:cursor-not-allowed disabled:bg-pinglix-300"
        >
          <Icon name="refresh" className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Checking..." : "Retry Connection"}
        </button>
      </aside>
    </section>
  );
}
