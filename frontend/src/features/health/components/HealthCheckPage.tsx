import { Link } from "react-router-dom";

import { BrandMark } from "../../../components/ui/BrandMark";
import { Icon } from "../../../components/ui/Icon";
import { API_BASE_URL } from "../../../lib/api-client";
import { HealthStatusCard } from "./HealthStatusCard";

const healthEndpoint = `${API_BASE_URL}/api/v1/health`;

export function HealthCheckPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 sm:inline-flex">
              Dev portal
            </span>
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-surface-low hover:text-pinglix-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pinglix-600"
            >
              <Icon name="profile" className="h-5 w-5" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-pinglix-200/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-pinglix-700">
              <Icon name="network" className="h-4 w-4" />
              Infrastructure · System status
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Pinglix
            </h1>
            <p className="mt-2 text-lg font-medium text-pinglix-800">
              Real-time conversations, instantly connected.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              A clear view of the public backend connection used by the
              Pinglix frontend.
            </p>
          </div>

          <HealthStatusCard />

          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-xs text-muted sm:flex-row">
            <span className="inline-flex items-center gap-2">
              <Icon name="network" className="h-4 w-4 text-pinglix-700" />
              Public health endpoint
            </span>
            <code className="max-w-full break-all rounded-md bg-surface-low px-2 py-1 font-mono text-[11px] text-slate-700">
              {healthEndpoint}
            </code>
          </div>

          <footer className="mt-8 text-center text-xs text-muted">
            pinglix.in · Phase 0–5 development status
          </footer>
        </div>
      </div>
    </main>
  );
}
