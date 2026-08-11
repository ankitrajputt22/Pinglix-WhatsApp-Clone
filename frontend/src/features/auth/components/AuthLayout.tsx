import type { ReactNode } from "react";

import { BrandMark } from "../../../components/ui/BrandMark";

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
    <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-8 text-ink sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-36 h-[26rem] w-[26rem] rounded-full bg-pinglix-200/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full bg-blue-100/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute right-[8%] top-[18%] hidden h-80 w-80 rotate-12 rounded-[3rem] border border-pinglix-200/60 lg:block"
      >
        <span className="absolute left-12 top-16 h-10 w-44 rounded-full bg-pinglix-100/80" />
        <span className="absolute right-10 top-36 h-10 w-36 rounded-full bg-blue-100/80" />
        <span className="absolute bottom-14 left-16 h-10 w-48 rounded-full bg-pinglix-50" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col justify-center">
        <header className="mb-7 text-center">
          <BrandMark className="mb-5 justify-center" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pinglix-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-pinglix-700 shadow-sm backdrop-blur">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-pinglix-600"
            />
            {eyebrow}
          </div>
        </header>

        <section className="animate-fade-in rounded-2xl border border-slate-300/80 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
              {description}
            </p>
          </div>
          {children}
        </section>

        <footer className="mt-6 text-center text-xs text-muted">
          pinglix.in · Secure access with HttpOnly cookies
        </footer>
      </div>
    </main>
  );
}
