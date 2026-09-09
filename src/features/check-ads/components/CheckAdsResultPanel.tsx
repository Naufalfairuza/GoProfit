import type {
    CalculationWarning,
    CampaignDiagnosis,
    CheckAdsInput,
    CheckAdsResult,
} from "@/domain/types";

interface CheckAdsResultPanelProps {
  result: CheckAdsResult;
  input: CheckAdsInput;
}

interface DiagnosisContent {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  tone:
    | "success"
    | "warning"
    | "danger"
    | "neutral";
}

export function CheckAdsResultPanel({
  result,
  input,
}: CheckAdsResultPanelProps) {
  const diagnosis = getDiagnosisContent(result.diagnosis);
  const hasAdditionalAdCost = input.campaign.additionalAdCost > 0;
  const hasProductEconomicsMismatch = result.warnings.some(
    (warning) => warning.code === "GMV_UNIT_ECONOMICS_MISMATCH",
  );
  const additionalWarnings = result.warnings.filter(
    (warning) =>
      warning.code !== "GMV_UNIT_ECONOMICS_MISMATCH" &&
      warning.code !== "ATTRIBUTED_DATA_ESTIMATE",
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Perkiraan hasil
        </p>

        <p className="mt-4 text-xs font-semibold text-[var(--gp-text-secondary)]">
          Perkiraan untung setelah iklan
        </p>

        <p
          className={[
            "mt-1 text-4xl font-bold tracking-[-0.06em]",
            result.estimatedProfitAfterAds <
            0
              ? "text-[var(--gp-danger)]"
              : "text-[var(--gp-text-primary)]",
          ].join(" ")}
        >
          {formatMoney(
            result.estimatedProfitAfterAds,
          )}
        </p>

        {hasProductEconomicsMismatch ? (
          <DataMismatchBanner />
        ) : (
          <DiagnosisBanner content={diagnosis} />
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="ROAS dari Shopee"
            value={formatRoas(result.reportedRoas)}
          />

          <MetricCard
            label="Biaya iklan per pesanan"
            value={formatOptionalMoney(result.cpa)}
          />

          <MetricCard
            label="Sisa sebelum iklan"
            value={formatMoney(result.breakdown.contributionBeforeAds)}
          />
        </div>

        <details className="mt-5 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-bold text-[var(--gp-text-primary)]">
            <span>Lihat detail angka iklan</span>
            <span aria-hidden="true" className="text-xl font-normal text-[var(--gp-text-secondary)]">
              +
            </span>
          </summary>

          <div className="border-t border-[var(--gp-border)] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="ROAS setelah semua biaya"
                value={formatRoas(result.economicRoas)}
              />

              <MetricCard
                label="ACOS dari Shopee"
                value={formatBps(result.reportedAcosBps)}
              />

              <MetricCard
                label="ACOS setelah semua biaya"
                value={formatBps(result.economicAcosBps)}
              />

              <MetricCard
                label="Biaya iklan per klik"
                value={formatOptionalMoney(result.cpc)}
              />

              <MetricCard
                label="Total biaya iklan"
                value={formatMoney(result.totalAdvertisingCost)}
              />

              {result.targetProfitTotal !== undefined && (
                <MetricCard
                  label="Target untung total"
                  value={formatMoney(result.targetProfitTotal)}
                />
              )}
            </div>

            <MetricGlossary />

            {hasAdditionalAdCost && (
              <div className="mt-4 rounded-xl bg-[var(--gp-brand-soft)] p-4">
                <p className="text-xs font-semibold">
                  Ada biaya iklan tambahan
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
                  ROAS setelah semua biaya sudah memasukkan biaya iklan utama
                  dan biaya tambahan.
                </p>
              </div>
            )}
          </div>
        </details>
      </section>

      {!hasProductEconomicsMismatch && (
        <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
          <SectionHeading
            eyebrow="Kesimpulan"
            title="Apa artinya untuk iklanmu?"
          />

          <p className="mt-4 text-sm leading-6 text-[var(--gp-text-secondary)]">
            {diagnosis.description}
          </p>

          <div className="mt-5 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--gp-brand-primary)]">
              Saran berikutnya
            </p>

            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--gp-text-primary)]">
              {diagnosis.action}
            </p>
          </div>
        </section>
      )}

      {additionalWarnings.length > 0 && (
        <details className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-bold text-[var(--gp-text-primary)]">
            <span>Catatan tambahan ({additionalWarnings.length})</span>
            <span aria-hidden="true" className="text-xl font-normal text-[var(--gp-text-secondary)]">
              +
            </span>
          </summary>

          <div className="border-t border-[var(--gp-border)] p-5">
            <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
              Catatan ini membantu memastikan data dan biaya yang dipakai sudah
              sesuai.
            </p>

            <div className="mt-4 space-y-3">
              {additionalWarnings.map((warning, index) => (
                <WarningCard
                  key={`${warning.code}-${index}`}
                  warning={warning}
                />
              ))}
            </div>
          </div>
        </details>
      )}

      <details className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-bold text-[var(--gp-text-primary)]">
          <span>Lihat detail biaya</span>
          <span aria-hidden="true" className="text-xl font-normal text-[var(--gp-text-secondary)]">
            +
          </span>
        </summary>

        <div className="border-t border-[var(--gp-border)] p-5">
          <SectionHeading
            eyebrow="Rincian biaya"
            title="Dari mana untungnya?"
          />

          <div className="mt-5 space-y-5">
            <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gp-text-muted)]">
              Angka produk
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <BreakdownTile
                label="Pendapatan efektif"
                value={formatMoney(
                  result.breakdown
                    .pricing
                    .effectiveRevenue,
                )}
              />

              <BreakdownTile
                label="Modal / HPP"
                value={`-${formatMoneyPositive(
                  result.breakdown.hpp,
                )}`}
                negative
              />

              <BreakdownTile
                label="Fee Shopee"
                value={`-${formatMoneyPositive(
                  result.breakdown
                    .fees.total,
                )}`}
                negative
              />

              <BreakdownTile
                label="Biaya operasional"
                value={`-${formatMoneyPositive(
                  result.breakdown
                    .costs.total,
                )}`}
                negative
              />
            </div>
            </div>

            <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gp-text-muted)]">
              Setelah biaya iklan
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <BreakdownTile
                label="Sisa sebelum iklan"
                value={formatMoney(
                  result.breakdown
                    .contributionBeforeAds,
                )}
                strong
              />

              <BreakdownTile
                label="Total biaya iklan"
                value={`-${formatMoneyPositive(
                  result.totalAdvertisingCost,
                )}`}
                negative
              />
            </div>
            </div>

            <div className="rounded-2xl border border-[var(--gp-brand-primary)]/20 bg-[var(--gp-brand-soft)] p-4">
            <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
              Perkiraan untung setelah iklan
            </p>
            <p
              className={[
                "mt-1 text-2xl font-bold tracking-[-0.04em]",
                result.estimatedProfitAfterAds <
                0
                  ? "text-[var(--gp-danger)]"
                  : "text-[var(--gp-text-primary)]",
              ].join(" ")}
            >
              {formatMoney(
                result.estimatedProfitAfterAds,
              )}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
              Sisa setelah penjualan dikurangi modal, biaya Shopee, biaya operasional, dan biaya iklan.
            </p>
            </div>
          </div>

          <p className="mt-5 text-[11px] leading-5 text-[var(--gp-text-muted)]">
            Perkiraan untung ini dihitung dari angka yang kamu masukkan.
            Hasilnya bukan laporan akuntansi dan bukan jaminan campaign
            berikutnya akan sama.
          </p>
        </div>
      </details>
    </div>
  );
}

function DataMismatchBanner() {
  return (
    <div
      role="status"
      className="mt-5 rounded-xl border border-[var(--gp-warning)] bg-[var(--gp-warning-soft)] p-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gp-warning)]">
        Catatan hasil
      </p>
      <p className="mt-1 text-sm font-bold leading-5 text-[var(--gp-text-primary)]">
        Penjualan dari iklan bisa mencakup beberapa produk.
      </p>
      <p className="mt-2 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
        Profit di atas dihitung dari harga dan modal yang kamu isi. Sementara
        itu, penjualan dari iklan bisa menggabungkan produk A, B, C, dan
        seterusnya.
      </p>
      <p className="mt-2 text-[11px] font-semibold leading-5 text-[var(--gp-text-primary)]">
        Ini bukan berarti perhitungannya salah. Kalau campaign menjual beberapa
        produk, hasil profit di atas masih berupa perkiraan dan belum
        memisahkan untung tiap produk.
      </p>
    </div>
  );
}

function DiagnosisBanner({
  content,
}: {
  content: DiagnosisContent;
}) {
  const toneClass =
    getToneClass(
      content.tone,
    );

  return (
    <div
      className={[
        "mt-5 rounded-xl border p-4",
        toneClass,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em]">
        {content.eyebrow}
      </p>

      <p className="mt-1 text-sm font-bold leading-5">
        {content.title}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-3">
      <p className="text-[10px] leading-4 text-[var(--gp-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[var(--gp-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function MetricGlossary() {
  const metrics = [
    {
      name: "ACOS dari Shopee",
      description:
        "Berapa persen biaya iklan utama dibandingkan penjualan dari iklan. Biasanya ini angka yang terlihat di Shopee.",
      formula: "Biaya iklan utama ÷ penjualan dari iklan",
    },
    {
      name: "ACOS setelah semua biaya",
      description:
        "Berapa persen seluruh biaya iklan dibandingkan penjualan dari iklan. Biaya tambahan juga ikut dihitung.",
      formula: "Total biaya iklan ÷ penjualan dari iklan",
    },
    {
      name: "Biaya iklan per klik (CPC)",
      description:
        "Rata-rata biaya untuk mendapatkan satu klik. Kalau jumlah klik kosong atau 0, angka ini belum bisa dihitung.",
      formula: "Total biaya iklan ÷ jumlah klik",
    },
    {
      name: "Biaya iklan per pesanan (CPA)",
      description:
        "Rata-rata biaya iklan untuk mendapatkan satu pesanan. Bandingkan dengan untung dari satu pesanan.",
      formula: "Total biaya iklan ÷ jumlah pesanan",
    },
  ];

  return (
    <div className="mt-5 rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gp-brand-soft)] text-xs font-bold text-[var(--gp-brand-primary)]"
        >
          i
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--gp-text-primary)]">
            Penjelasan angka
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Buka bagian ini kalau ingin tahu arti setiap angka.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="rounded-xl border border-[var(--gp-border)] bg-white p-3"
          >
            <p className="text-xs font-bold text-[var(--gp-text-primary)]">
              {metric.name}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
              {metric.description}
            </p>
            <p className="mt-2 text-[10px] font-semibold text-[var(--gp-brand-primary)]">
              Rumus: {metric.formula}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-lg font-bold tracking-[-0.03em]">
        {title}
      </h3>
    </>
  );
}

function BreakdownTile({
  label,
  value,
  strong = false,
  negative = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(32,33,36,0.06)]">
      <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-lg tracking-[-0.03em]",
          strong
            ? "font-bold text-[var(--gp-text-primary)]"
            : negative
              ? "font-semibold text-[var(--gp-danger)]"
              : "font-semibold text-[var(--gp-text-primary)]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function WarningCard({
  warning,
}: {
  warning: CalculationWarning;
}) {
  const content =
    getWarningContent(
      warning,
    );

  return (
    <div
      className={[
        "rounded-xl border p-4",
        warning.severity ===
        "WARNING"
          ? "border-[var(--gp-warning)] bg-[var(--gp-warning-soft)]"
          : "border-[var(--gp-border)] bg-[var(--gp-surface-soft)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold">
          {content.title}
        </p>

        <span className="shrink-0 rounded-full border border-current px-2 py-0.5 text-[9px] font-bold">
          {warning.severity ===
          "WARNING"
            ? "PERIKSA"
            : "INFO"}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
        {content.description}
      </p>
    </div>
  );
}

function getDiagnosisContent(
  diagnosis: CampaignDiagnosis,
): DiagnosisContent {
  switch (diagnosis) {
    case "LOSS":
      return {
        eyebrow:
          "Berpotensi rugi",

        title:
          "Iklan berpotensi membuat produk rugi.",

        description:
          "Setelah modal, biaya Shopee, biaya operasional, dan biaya iklan dihitung, sisa uangnya menjadi negatif. ROAS yang terlihat bagus di Shopee belum tentu berarti campaign menghasilkan untung.",

        action:
          "Jangan tambah budget dulu. Cek biaya iklan, harga jual, biaya Shopee, modal, dan data penjualan sebelum melanjutkan campaign.",

        tone:
          "danger",
      };

    case "BREAK_EVEN":
      return {
        eyebrow:
          "Hampir tidak untung",

        title:
          "Iklan hanya menutup biaya dan belum memberi untung.",

        description:
          "Sisa uang dari penjualan habis untuk membayar biaya iklan. Setelah semua biaya dihitung, campaign belum memberi untung yang berarti.",

        action:
          "Cari cara agar biaya iklan lebih rendah atau untung per produk lebih besar sebelum menambah budget.",

        tone:
          "warning",
      };

    case "PROFITABLE":
      return {
        eyebrow:
          "Masih berpotensi untung",

        title:
          "Iklan masih berpotensi menghasilkan profit.",

        description:
          "Setelah modal, biaya Shopee, biaya operasional, dan iklan dibayar, masih ada sisa uang. Karena target untung belum diisi, hasil ini belum menilai apakah jumlahnya sudah cukup untuk bisnis kamu.",

        action:
          "Isi target untung jika kamu ingin tahu apakah hasil campaign sudah cukup sesuai target tokomu.",

        tone:
          "success",
      };

    case "BELOW_TARGET":
      return {
        eyebrow:
          "Untung di bawah target",

        title:
          "Iklan masih menghasilkan untung, tapi belum sesuai target.",

        description:
          "Campaign masih menghasilkan sisa uang positif, tetapi jumlahnya lebih kecil dari target untung yang kamu masukkan. Jadi masih untung belum tentu target bisnis sudah tercapai.",

        action:
          "Cek selisih terhadap target. Evaluasi biaya per pesanan, total biaya iklan, fee, dan harga jual sebelum menambah budget.",

        tone:
          "warning",
      };

    case "TARGET_MET":
      return {
        eyebrow:
          "Target tercapai",

        title:
          "Iklan masih menyisakan target untungmu.",

        description:
          "Setelah modal, biaya Shopee, biaya operasional, dan biaya iklan dibayar, perkiraan untung masih sama dengan atau lebih besar dari targetmu.",

        action:
          "Kalau ingin menambah budget, lakukan sedikit demi sedikit dan cek ulang hasilnya. Campaign berikutnya belum tentu menghasilkan angka yang sama.",

        tone:
          "success",
      };
  }
}

function getWarningContent(
  warning: CalculationWarning,
): {
  title: string;
  description: string;
} {
  switch (warning.code) {
    case "GMV_UNIT_ECONOMICS_MISMATCH":
      return {
        title:
          "Penjualan dari Ads berbeda dari hitungan produk",

        description:
          "Angka penjualan dari Ads tidak sama dengan hitungan berdasarkan harga, potongan, dan jumlah barang yang kamu masukkan. Pastikan periode, produk, jumlah barang, harga, diskon, dan voucher yang dibandingkan sama.",
      };

    case "USING_PRESET_FEE":
      return {
        title:
          "Fee yang dipakai masih fee contoh",

        description:
          "Cek apakah fee contoh ini sama dengan biaya yang benar-benar dikenakan pada tokomu.",
      };

    case "NO_CLICKS":
      return {
        title:
          "CPC belum bisa dihitung",

        description:
          "Jumlah klik masih 0, jadi biaya rata-rata untuk satu klik belum bisa dihitung.",
      };

    case "NO_ORDERS":
      return {
        title:
          "CPA dan untung per pesanan belum bisa dihitung",

        description:
          "Jumlah pesanan masih 0. Angka lain tetap bisa dihitung jika datanya tersedia.",
      };

    case "NO_MEDIA_AD_SPEND":
      return {
        title:
          "Biaya iklan utama masih Rp0",

        description:
          "ROAS dari Shopee belum bisa dihitung karena biaya iklan utama masih Rp0. Jika ada biaya iklan lain, ROAS setelah semua biaya bisa tetap berbeda.",
      };

    case "ATTRIBUTED_DATA_ESTIMATE":
      return {
        title:
          "Penjualan ini adalah hasil atribusi Ads",

        description:
          "Penjualan dari Ads mengikuti cara Shopee mengatribusikan pesanan. Angka ini belum tentu sama dengan pendapatan akhir setelah semua pesanan dicek.",
      };

    case "MULTI_UNIT_ORDER_ESTIMATE":
      return {
        title:
          "Jumlah pesanan dan barang berbeda",

        description:
          "Satu pesanan bisa berisi lebih dari satu barang. Karena itu, biaya per barang dan per pesanan dihitung berbeda. Hasil GOProfit tetap berupa perkiraan dari angka yang kamu masukkan.",
      };

    case "LIVE_ATTRIBUTION_ESTIMATE":
      return {
        title: "Penjualan Shopee Live belum dirinci",
        description:
          "Jumlah pesanan dan barang dari Shopee Live belum diisi. Untuk sementara GOProfit menganggap semuanya berasal dari Live. Isi angka Live agar biaya Live XTRA tidak terlalu besar.",
      };
  }
}

function getToneClass(
  tone:
    DiagnosisContent["tone"],
): string {
  switch (tone) {
    case "success":
      return "border-[var(--gp-success)] bg-[var(--gp-success-soft)] text-[var(--gp-success)]";

    case "warning":
      return "border-[var(--gp-warning)] bg-[var(--gp-warning-soft)] text-[var(--gp-warning)]";

    case "danger":
      return "border-[var(--gp-danger)] bg-[var(--gp-danger-soft)] text-[var(--gp-danger)]";

    case "neutral":
      return "border-[var(--gp-border)] bg-[var(--gp-surface-soft)] text-[var(--gp-text-primary)]";
  }
}

function formatMoney(
  value: number,
): string {
  if (value < 0) {
    return `-Rp${Math.abs(
      value,
    ).toLocaleString(
      "id-ID",
    )}`;
  }

  return `Rp${value.toLocaleString(
    "id-ID",
  )}`;
}

function formatMoneyPositive(
  value: number,
): string {
  return `Rp${Math.abs(
    value,
  ).toLocaleString(
    "id-ID",
  )}`;
}

function formatOptionalMoney(
  value:
    | number
    | undefined,
): string {
  if (
    value === undefined
  ) {
    return "—";
  }

  return formatMoney(value);
}

function formatRoas(
  value:
    | number
    | undefined,
): string {
  if (
    value === undefined
  ) {
    return "—";
  }

  return value.toLocaleString(
    "id-ID",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  );
}

function formatBps(
  value:
    | number
    | undefined,
): string {
  if (
    value === undefined
  ) {
    return "—";
  }

  return `${(
    value / 100
  ).toLocaleString(
    "id-ID",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  )}%`;
}
