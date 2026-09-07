import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-[1180px] px-4 pb-8 md:px-6">
      <div className="flex flex-col gap-3 border-t border-[var(--gp-border)] pt-5 text-xs leading-5 text-[var(--gp-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          GOProfit memberikan estimasi berdasarkan data yang kamu masukkan,
          bukan laporan akuntansi atau jaminan hasil campaign.
        </p>

        <Link
          href="/privacy"
          className="shrink-0 font-semibold text-[var(--gp-text-secondary)] underline-offset-4 hover:text-[var(--gp-brand-primary)] hover:underline"
        >
          Privacy & disclaimer
        </Link>
      </div>
    </footer>
  );
}
