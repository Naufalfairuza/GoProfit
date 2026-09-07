"use client";

import { useState } from "react";

import type {
  CheckAdsInput,
  CheckAdsResult,
  PlanAdsInput,
  PlanAdsResult,
} from "@/domain/types";

import { BrowserScenarioRepository } from "@/services/persistence/browser-scenario.repository";

interface SaveCalculationButtonProps {
  kind: "PLAN" | "CHECK";
  planInput: PlanAdsInput;
  planResult?: PlanAdsResult;
  checkInput?: CheckAdsInput;
  checkResult?: CheckAdsResult;
}

const repository = new BrowserScenarioRepository();

export function SaveCalculationButton({
  kind,
  planInput,
  planResult,
  checkInput,
  checkResult,
}: SaveCalculationButtonProps) {
  const [isNaming, setIsNaming] = useState(false);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Beri nama agar perhitungan ini mudah ditemukan lagi.");
      return;
    }

    setSaving(true);
    setError(null);

    const now = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `calculation-${Date.now()}`;

    try {
      await repository.save({
        id,
        name: trimmedName,
        kind,
        planInput: checkInput?.economics ?? planInput,
        planResult: kind === "PLAN" ? planResult : undefined,
        checkResult: kind === "CHECK" ? checkResult : undefined,
        createdAt: now,
        updatedAt: now,
      });

      setSaved(true);
      setIsNaming(false);
    } catch {
      setError("Perhitungan tidak bisa disimpan di browser ini.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-[var(--gp-success)] bg-[var(--gp-success-soft)] p-4">
        <p className="text-sm font-bold text-[var(--gp-success)]">
          Perhitungan tersimpan di browser ini.
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
          Kamu bisa membukanya lagi dari menu Saved.
        </p>
      </div>
    );
  }

  if (!isNaming) {
    return (
      <button
        type="button"
        onClick={() => setIsNaming(true)}
        className="flex min-h-11 w-full items-center justify-center rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] bg-white px-4 text-sm font-bold text-[var(--gp-text-primary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
      >
        Simpan perhitungan
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-white p-4">
      <label
        htmlFor={`save-${kind.toLowerCase()}-name`}
        className="block text-sm font-bold text-[var(--gp-text-primary)]"
      >
        Nama perhitungan
      </label>
      <input
        id={`save-${kind.toLowerCase()}-name`}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
        placeholder={
          kind === "PLAN"
            ? "Contoh: Produk A - harga normal"
            : "Contoh: Campaign minggu ini"
        }
        className="mt-3 h-11 w-full rounded-[var(--gp-radius-input)] border border-[var(--gp-border)] bg-white px-3 text-sm outline-none focus:border-[var(--gp-brand-primary)] focus:ring-4 focus:ring-[var(--gp-brand-soft)]"
        autoFocus
      />

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-[var(--gp-danger)]">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setIsNaming(false);
            setError(null);
          }}
          className="min-h-10 flex-1 rounded-lg border border-[var(--gp-border)] px-3 text-xs font-bold text-[var(--gp-text-secondary)]"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-10 flex-1 rounded-lg bg-[var(--gp-brand-primary)] px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}
