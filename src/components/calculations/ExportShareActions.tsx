"use client";

import { useState } from "react";

import type {
  CheckAdsResult,
  PlanAdsResult,
} from "@/domain/types";

interface ExportShareActionsProps {
  kind: "PLAN" | "CHECK";
  planResult?: PlanAdsResult;
  checkResult?: CheckAdsResult;
}

export function ExportShareActions({
  kind,
  planResult,
  checkResult,
}: ExportShareActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  function exportResult() {
    const content = buildExportText({
      kind,
      planResult,
      checkResult,
    });
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `goprofit-${kind.toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Hasil berhasil diekspor.");
  }

  function exportCsv() {
    const content = `\uFEFF${buildExportCsv({
      kind,
      planResult,
      checkResult,
    })}`;
    const blob = new Blob([content], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `goprofit-${kind.toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("CSV berhasil diekspor.");
  }

  async function shareResult() {
    const content = buildExportText({
      kind,
      planResult,
      checkResult,
    });

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Hasil GOProfit",
          text: content,
        });
        setStatus("Hasil siap dibagikan.");
        return;
      }

      await navigator.clipboard.writeText(content);
      setStatus("Hasil disalin. Kamu bisa menempelkannya di chat atau notes.");
    } catch {
      setStatus("Hasil belum bisa dibagikan dari browser ini.");
    }
  }

  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[var(--gp-text-primary)]">
            Bawa hasilnya
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
            Simpan sebagai teks atau bagikan ke timmu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportResult}
            className="min-h-10 rounded-lg border border-[var(--gp-border)] bg-white px-3 text-xs font-bold text-[var(--gp-text-primary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
          >
            Export .txt
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="min-h-10 rounded-lg border border-[var(--gp-border)] bg-white px-3 text-xs font-bold text-[var(--gp-text-primary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => void shareResult()}
            className="min-h-10 rounded-lg bg-[var(--gp-brand-primary)] px-3 text-xs font-bold text-white transition hover:brightness-95"
          >
            Bagikan
          </button>
        </div>
      </div>

      {status && (
        <p className="mt-3 text-[11px] font-medium text-[var(--gp-success)]" role="status">
          {status}
        </p>
      )}
    </div>
  );
}

function buildExportText({
  kind,
  planResult,
  checkResult,
}: ExportShareActionsProps): string {
  const lines = [
    "GOProfit",
    kind === "PLAN" ? "Plan My Ads" : "Check My Ads",
    `Dibuat: ${new Date().toLocaleString("id-ID")}`,
    "",
  ];

  if (kind === "PLAN" && planResult) {
    lines.push(`Status: ${planStatusLabel(planResult.status)}`);
    lines.push(
      `Profit sebelum iklan: ${formatMoney(
        planResult.breakdown.contributionBeforeAds,
      )}`,
    );
    if ("breakEvenRoas" in planResult) {
      lines.push(
        `ROAS BEP: ${formatRoas(planResult.breakEvenRoas)}`,
      );
      lines.push(
        `BEP ACOS: ${formatBps(planResult.breakEvenAcosBps)}`,
      );
    }

    if ("minimumTargetRoas" in planResult) {
      lines.push(
        `Minimum ROAS Aman: ${formatRoas(
          planResult.minimumTargetRoas,
        )}`,
      );
      lines.push(
        `Max Ads / Order: ${formatMoney(
          planResult.maxAdsCostForTarget,
        )}`,
      );
    }
  }

  if (kind === "CHECK" && checkResult) {
    lines.push(`Diagnosis: ${diagnosisLabel(checkResult.diagnosis)}`);
    lines.push(
      `Estimated Profit After Ads: ${formatMoney(
        checkResult.estimatedProfitAfterAds,
      )}`,
    );
    lines.push(
      `Reported ROAS: ${formatOptionalRoas(checkResult.reportedRoas)}`,
    );
    lines.push(
      `Economic ROAS: ${formatOptionalRoas(checkResult.economicRoas)}`,
    );
    lines.push(
      `Reported ACOS: ${formatOptionalBps(checkResult.reportedAcosBps)}`,
    );
    lines.push(
      `Economic ACOS: ${formatOptionalBps(checkResult.economicAcosBps)}`,
    );
    lines.push(`CPC: ${formatOptionalMoney(checkResult.cpc)}`);
    lines.push(`CPA: ${formatOptionalMoney(checkResult.cpa)}`);
  }

  lines.push(
    "",
    "Catatan: hasil ini adalah estimasi berdasarkan input pengguna, bukan laporan akuntansi atau jaminan performa campaign.",
  );

  return lines.join("\n");
}

function buildExportCsv({
  kind,
  planResult,
  checkResult,
}: ExportShareActionsProps): string {
  const rows: Array<[string, string]> = [
    ["aplikasi", "GOProfit"],
    ["mode", kind === "PLAN" ? "Plan My Ads" : "Check My Ads"],
    ["dibuat", new Date().toLocaleString("id-ID")],
  ];

  if (kind === "PLAN" && planResult) {
    rows.push(
      ["status", planStatusLabel(planResult.status)],
      [
        "pendapatan efektif",
        formatMoney(planResult.breakdown.pricing.effectiveRevenue),
      ],
      ["HPP", formatMoney(planResult.breakdown.hpp)],
      [
        "total marketplace fee",
        formatMoney(planResult.breakdown.fees.total),
      ],
      [
        "total biaya operasional",
        formatMoney(planResult.breakdown.costs.total),
      ],
      [
        "profit sebelum iklan",
        formatMoney(planResult.breakdown.contributionBeforeAds),
      ],
    );

    if ("breakEvenRoas" in planResult) {
      rows.push(
        ["ROAS BEP", formatRoas(planResult.breakEvenRoas)],
        ["BEP ACOS", formatBps(planResult.breakEvenAcosBps)],
      );
    }

    if ("minimumTargetRoas" in planResult) {
      rows.push(
        ["minimum ROAS aman", formatRoas(planResult.minimumTargetRoas)],
        ["max ads per order", formatMoney(planResult.maxAdsCostForTarget)],
      );
    }
  }

  if (kind === "CHECK" && checkResult) {
    rows.push(
      ["diagnosis", diagnosisLabel(checkResult.diagnosis)],
      [
        "pendapatan efektif",
        formatMoney(checkResult.breakdown.pricing.effectiveRevenue),
      ],
      ["HPP", formatMoney(checkResult.breakdown.hpp)],
      [
        "total marketplace fee",
        formatMoney(checkResult.breakdown.fees.total),
      ],
      [
        "total biaya operasional",
        formatMoney(checkResult.breakdown.costs.total),
      ],
      [
        "contribution sebelum iklan",
        formatMoney(checkResult.breakdown.contributionBeforeAds),
      ],
      [
        "total biaya iklan",
        formatMoney(checkResult.totalAdvertisingCost),
      ],
      [
        "estimated profit after ads",
        formatMoney(checkResult.estimatedProfitAfterAds),
      ],
      ["reported ROAS", formatOptionalRoas(checkResult.reportedRoas)],
      ["economic ROAS", formatOptionalRoas(checkResult.economicRoas)],
      ["reported ACOS", formatOptionalBps(checkResult.reportedAcosBps)],
      ["economic ACOS", formatOptionalBps(checkResult.economicAcosBps)],
      ["CPC", formatOptionalMoney(checkResult.cpc)],
      ["CPA", formatOptionalMoney(checkResult.cpa)],
    );
  }

  return [
    ["metrik", "nilai"],
    ...rows,
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function planStatusLabel(status: PlanAdsResult["status"]): string {
  switch (status) {
    case "TARGET_FEASIBLE":
      return "Target feasible";
    case "TARGET_NOT_FEASIBLE":
      return "Target belum feasible";
    case "BREAK_EVEN_ONLY":
      return "Break even only";
    case "NOT_ADS_FEASIBLE":
      return "Belum layak untuk ads";
  }
}

function diagnosisLabel(diagnosis: CheckAdsResult["diagnosis"]): string {
  switch (diagnosis) {
    case "LOSS":
      return "Campaign loss";
    case "BREAK_EVEN":
      return "Break even";
    case "PROFITABLE":
      return "Profitable";
    case "BELOW_TARGET":
      return "Below target";
    case "TARGET_MET":
      return "Target met";
  }
}

function formatMoney(value: number): string {
  return value < 0
    ? `-Rp${Math.abs(value).toLocaleString("id-ID")}`
    : `Rp${value.toLocaleString("id-ID")}`;
}

function formatOptionalMoney(value: number | undefined): string {
  return value === undefined ? "—" : formatMoney(value);
}

function formatRoas(value: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatOptionalRoas(value: number | undefined): string {
  return value === undefined ? "—" : formatRoas(value);
}

function formatBps(value: number): string {
  return `${(value / 100).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatOptionalBps(value: number | undefined): string {
  return value === undefined ? "—" : formatBps(value);
}
