"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/plan", label: "Plan My Ads" },
  { href: "/check", label: "Check My Ads" },
  { href: "/saved", label: "Saved" },
  { href: "/learn", label: "Learn" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--gp-border)]/80 bg-white/95 shadow-[0_4px_20px_rgba(32,33,36,0.03)] backdrop-blur">
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
            className="hidden items-center gap-1 rounded-full bg-[var(--gp-surface-soft)] p-1 text-sm font-medium text-[var(--gp-text-secondary)] md:flex"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => (
              <HeaderNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </nav>

          <span className="rounded-full bg-[var(--gp-brand-soft)] px-3 py-1 text-xs font-bold text-[var(--gp-brand-primary)]">
            BETA
          </span>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto pb-3 text-xs font-semibold text-[var(--gp-text-secondary)] md:hidden"
          aria-label="Navigasi mobile"
        >
          {navItems.map((item) => (
            <HeaderNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActivePath(pathname, item.href)}
              mobile
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function HeaderNavLink({
  href,
  label,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "shrink-0 rounded-full transition",
        mobile ? "px-3 py-2" : "px-3 py-2",
        active
          ? "bg-white font-bold text-[var(--gp-brand-primary)] shadow-[0_2px_8px_rgba(32,33,36,0.08)] ring-1 ring-[var(--gp-brand-soft)]"
          : "hover:bg-white hover:text-[var(--gp-text-primary)]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function isActivePath(pathname: string | null, href: string): boolean {
  return pathname === href || pathname?.startsWith(`${href}/`) === true;
}
