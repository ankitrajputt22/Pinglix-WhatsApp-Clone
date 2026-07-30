import { API_BASE_URL } from "../../../lib/api-client";
import { HealthStatusCard } from "./HealthStatusCard";

const healthEndpoint = `${API_BASE_URL}/api/v1/health`;

export function HealthCheckPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf8] px-4 py-10 text-ink sm:px-6 sm:py-14">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-pinglix-200/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full bg-emerald-100/70 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col justify-center">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pinglix-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pinglix-700 shadow-sm backdrop-blur">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-pinglix-500"
            />
            Foundation check
          </div>

          <h1 className="text-4xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">
            Pinglix
          </h1>
          <p className="mt-3 text-lg font-medium text-pinglix-700 sm:text-xl">
            Real-time conversations, instantly connected.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            The frontend is checking that the Pinglix backend is available and
            ready for the next development phase.
          </p>
        </header>

        <HealthStatusCard />

        <p className="mt-5 break-all text-center text-xs leading-5 text-muted">
          Checking{" "}
          <code className="rounded bg-white/75 px-1.5 py-1 font-mono text-[11px] text-pinglix-800">
            {healthEndpoint}
          </code>
        </p>

        <footer className="mt-10 text-center text-xs text-muted">
          pinglix.in · Frontend foundation
        </footer>
      </div>
    </main>
  );
}
