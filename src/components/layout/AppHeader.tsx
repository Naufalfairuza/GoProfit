import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-[var(--gp-border)] bg-white">
      <div className="mx-auto max-w-[1180px] px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-[-0.04em] text-[var(--gp-text-primary)]"
          >
            <span className="text-[var(--gp-brand-primary)]">GO</span>
            Profit
          </Link>

          <nav
            className="hidden items-center gap-7 text-sm font-medium text-[var(--gp-text-secondary)] md:flex"
            aria-label="Navigasi utama"
          >
            <Link
              href="/plan"
              className="transition hover:text-[var(--gp-text-primary)]"
            >
              Plan My Ads
            </Link>

            <Link
              href="/check"
              className="transition hover:text-[var(--gp-text-primary)]"
            >
              Check My Ads
            </Link>

            <Link
              href="/saved"
              className="transition hover:text-[var(--gp-text-primary)]"
            >
              Saved
            </Link>

            <Link
              href="/learn"
              className="transition hover:text-[var(--gp-text-primary)]"
            >
              Learn
            </Link>
          </nav>

          <span className="rounded-full bg-[var(--gp-brand-soft)] px-3 py-1 text-xs font-bold text-[var(--gp-brand-primary)]">
            BETA
          </span>
        </div>

        <nav
          className="flex gap-5 overflow-x-auto pb-3 text-xs font-semibold text-[var(--gp-text-secondary)] md:hidden"
          aria-label="Navigasi mobile"
        >
          <Link
            href="/plan"
            className="shrink-0 hover:text-[var(--gp-text-primary)]"
          >
            Plan My Ads
          </Link>
          <Link
            href="/check"
            className="shrink-0 hover:text-[var(--gp-text-primary)]"
          >
            Check My Ads
          </Link>
          <Link
            href="/saved"
            className="shrink-0 hover:text-[var(--gp-text-primary)]"
          >
            Saved
          </Link>
          <Link
            href="/learn"
            className="shrink-0 hover:text-[var(--gp-text-primary)]"
          >
            Learn
          </Link>
        </nav>
      </div>
    </header>
  );
}
