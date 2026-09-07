"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrowserScenarioRepository } from "@/services/persistence/browser-scenario.repository";
import type { SavedCalculation } from "@/services/persistence/scenario.repository";

const repository = new BrowserScenarioRepository();

export default function SavedPage() {
  const [items, setItems] = useState<SavedCalculation[] | null>(null);

  async function refresh() {
    setItems(await repository.list());
  }

  useEffect(() => {
    let cancelled = false;

    void repository.list().then((values) => {
      if (!cancelled) {
        setItems(values);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id: string) {
    await repository.delete(id);
    await refresh();
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Saved calculations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] md:text-4xl">
          Perhitungan tersimpan
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)] md:text-base">
          Data disimpan lokal di browser ini. Tidak ada akun atau sinkronisasi
          cloud pada versi beta.
        </p>
      </div>

      {items === null ? (
        <div className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-6 text-sm text-[var(--gp-text-secondary)]">
          Memuat perhitungan...
        </div>
      ) : items.length === 0 ? (
        <EmptySavedState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <SavedCard key={item.id} item={item} onDelete={remove} />
          ))}
        </div>
      )}
    </main>
  );
}

function SavedCard({
  item,
  onDelete,
}: {
  item: SavedCalculation;
  onDelete: (id: string) => Promise<void>;
}) {
  const planStatus = item.planResult?.status;
  const diagnosis = item.checkResult?.diagnosis;

  return (
    <article className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[var(--gp-brand-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--gp-brand-primary)]">
            {item.kind === "PLAN" ? "Plan My Ads" : "Check My Ads"}
          </span>
          <h2 className="mt-3 text-lg font-bold tracking-[-0.03em]">
            {item.name}
          </h2>
        </div>
        <span className="text-xs text-[var(--gp-text-muted)]">Shopee</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SavedMetric
          label={item.kind === "PLAN" ? "Status" : "Diagnosis"}
          value={formatStatus(planStatus ?? diagnosis ?? "-")}
        />
        <SavedMetric label="Diperbarui" value={formatDate(item.updatedAt)} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--gp-border)] pt-4">
        <Link
          href={item.kind === "PLAN" ? "/plan" : "/check"}
          className="text-sm font-bold text-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-hover)]"
        >
          Buat perhitungan baru →
        </Link>
        <button
          type="button"
          onClick={() => void onDelete(item.id)}
          className="text-xs font-semibold text-[var(--gp-danger)] hover:underline"
        >
          Hapus
        </button>
      </div>
    </article>
  );
}

function SavedMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--gp-surface-soft)] p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--gp-text-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-[var(--gp-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function EmptySavedState() {
  return (
    <section className="rounded-[var(--gp-radius-card)] border border-dashed border-[var(--gp-border)] bg-white p-8 text-center">
      <p className="text-lg font-bold">Belum ada perhitungan tersimpan</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--gp-text-secondary)]">
        Setelah menghitung ROAS atau mengecek campaign, klik Simpan
        perhitungan untuk menyimpan snapshot angka tersebut.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/plan"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--gp-radius-button)] bg-[var(--gp-brand-primary)] px-5 text-sm font-bold text-white"
        >
          Hitung ROAS
        </Link>
        <Link
          href="/check"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] px-5 text-sm font-bold"
        >
          Cek campaign
        </Link>
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}
