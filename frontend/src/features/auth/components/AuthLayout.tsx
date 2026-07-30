import type { ReactNode } from "react";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  description,
  children
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf8] px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-44 h-[28rem] w-[28rem] rounded-full bg-pinglix-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-52 -right-32 h-[30rem] w-[30rem] rounded-full bg-emerald-100/80 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <header className="mb-7 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pinglix-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-pinglix-700 shadow-sm backdrop-blur">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-pinglix-500"
            />
            {eyebrow}
          </div>
          <p className="text-4xl font-bold tracking-[-0.04em] text-ink">
            Pinglix
          </p>
          <p className="mt-2 text-sm font-medium text-pinglix-700 sm:text-base">
            Real-time conversations, instantly connected.
          </p>
        </header>

        <section className="rounded-3xl border border-white/90 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
          {children}
        </section>

        <footer className="mt-6 text-center text-xs text-muted">
          pinglix.in · Secure authentication
        </footer>
      </div>
    </main>
  );
}
