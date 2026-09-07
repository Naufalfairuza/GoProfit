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
  const diagnosis =
    getDiagnosisContent(
      result.diagnosis,
    );

  const hasAdditionalAdCost =
    input.campaign.additionalAdCost >
    0;

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Estimated Result
        </p>

        <p className="mt-4 text-xs font-semibold text-[var(--gp-text-secondary)]">
          Estimated Profit After Ads
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

        {result.estimatedProfitPerOrder !==
          undefined && (
          <p className="mt-2 text-xs text-[var(--gp-text-secondary)]">
            {formatMoney(
              result.estimatedProfitPerOrder,
            )}{" "}
            estimasi profit / order
          </p>
        )}

        <DiagnosisBanner
          content={
            diagnosis
          }
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard
            label="Reported ROAS"
            value={formatRoas(
              result.reportedRoas,
            )}
          />

          <MetricCard
            label="Economic ROAS"
            value={formatRoas(
              result.economicRoas,
            )}
          />

          <MetricCard
            label="Economic ACOS"
            value={formatBps(
              result.economicAcosBps,
            )}
          />

          <MetricCard
            label="CPA"
            value={formatOptionalMoney(
              result.cpa,
            )}
          />
        </div>

        <MetricGlossary />

        {hasAdditionalAdCost && (
          <div className="mt-4 rounded-xl bg-[var(--gp-brand-soft)] p-4">
            <p className="text-xs font-semibold">
              Economic ROAS lebih
              relevan untuk profit
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
              Ada biaya iklan
              tambahan di luar media
              ad spend. Karena itu
              Economic ROAS
              memasukkan seluruh
              biaya iklan, bukan
              hanya angka spend yang
              dilaporkan marketplace.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
        <SectionHeading
          eyebrow="Facts"
          title="Apa yang terjadi?"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <FactTile
            label="Contribution sebelum iklan"
            value={formatMoney(
              result.breakdown
                .contributionBeforeAds,
            )}
          />

          <FactTile
            label="Total biaya iklan"
            value={formatMoney(
              result.totalAdvertisingCost,
            )}
          />

          <FactTile
            label="Estimated profit setelah iklan"
            value={formatMoney(
              result.estimatedProfitAfterAds,
            )}
            strong
          />

          {result.targetProfitTotal !==
            undefined && (
            <FactTile
              label="Target profit total"
              value={formatMoney(
                result.targetProfitTotal,
              )}
            />
          )}

          <FactTile
            label="Reported ACOS"
            value={formatBps(
              result.reportedAcosBps,
            )}
          />

          <FactTile
            label="Economic ACOS"
            value={formatBps(
              result.economicAcosBps,
            )}
          />

          <FactTile
            label="CPC"
            value={formatOptionalMoney(
              result.cpc,
            )}
          />

          <FactTile
            label="CPA"
            value={formatOptionalMoney(
              result.cpa,
            )}
          />
        </div>
      </section>

      <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
        <SectionHeading
          eyebrow="Diagnosis"
          title="Kenapa hasilnya seperti ini?"
        />

        <p className="mt-4 text-sm leading-6 text-[var(--gp-text-secondary)]">
          {diagnosis.description}
        </p>

        <div className="mt-5 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--gp-brand-primary)]">
            Action
          </p>

          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--gp-text-primary)]">
            {diagnosis.action}
          </p>
        </div>
      </section>

      {result.warnings.length >
        0 && (
        <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
          <SectionHeading
            eyebrow="Check"
            title="Catatan perhitungan"
          />

          <p className="mt-2 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Catatan ini tidak
            otomatis berarti
            campaign salah. Gunakan
            untuk memastikan data
            yang dibandingkan memang
            berasal dari scope yang
            sama.
          </p>

          <div className="mt-5 space-y-3">
            {result.warnings.map(
              (
                warning,
                index,
              ) => (
                <WarningCard
                  key={`${warning.code}-${index}`}
                  warning={
                    warning
                  }
                />
              ),
            )}
          </div>
        </section>
      )}

      <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
        <SectionHeading
          eyebrow="Breakdown"
          title="Dari mana profitnya?"
        />

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gp-text-muted)]">
              Ekonomi produk
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
                label="HPP"
                value={`-${formatMoneyPositive(
                  result.breakdown.hpp,
                )}`}
                negative
              />

              <BreakdownTile
                label="Marketplace fee"
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
                label="Contribution sebelum iklan"
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
              Estimated Profit After Ads
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
              Sisa setelah pendapatan dikurangi HPP, fee, biaya operasional, dan biaya iklan.
            </p>
          </div>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-[var(--gp-text-muted)]">
          Estimated Profit After
          Ads adalah estimasi dari
          data yang kamu masukkan,
          bukan laporan laba bersih
          akuntansi dan bukan
          jaminan performa campaign
          berikutnya.
        </p>
      </section>
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
      name: "Reported ACOS",
      description:
        "Persentase media ad spend dibanding GMV yang dilaporkan dari Ads. Ini angka yang biasanya terlihat di dashboard marketplace.",
      formula: "Media ad spend ÷ GMV Ads",
    },
    {
      name: "Economic ACOS",
      description:
        "Persentase seluruh biaya iklan dibanding GMV Ads. Angka ini memasukkan biaya iklan tambahan yang kamu input.",
      formula: "Total biaya iklan ÷ GMV Ads",
    },
    {
      name: "CPC",
      description:
        "Rata-rata biaya untuk satu klik. Jika klik kosong atau 0, CPC tidak bisa dihitung.",
      formula: "Total biaya iklan ÷ klik",
    },
    {
      name: "CPA",
      description:
        "Rata-rata biaya iklan untuk mendapatkan satu order. Jika order 0, CPA tidak tersedia.",
      formula: "Total biaya iklan ÷ order",
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
            Cara membaca metrik
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Tidak semua angka menjawab pertanyaan yang sama. Gunakan definisi
            ini sebelum mengambil keputusan dari hasil campaign.
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

function FactTile({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
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
            : "font-semibold text-[var(--gp-text-primary)]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
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
          "Campaign Loss",

        title:
          "Biaya iklan lebih besar dari contribution yang tersedia.",

        description:
          "Setelah HPP, fee, biaya operasional, dan biaya iklan dihitung, campaign menghasilkan estimasi profit negatif. ROAS yang terlihat di marketplace tidak boleh digunakan sendiri untuk menyimpulkan campaign ini menguntungkan.",

        action:
          "Jangan menaikkan spend berdasarkan ROAS saja. Periksa CPA, biaya iklan, harga jual, fee, HPP, serta data atribusi sebelum memutuskan langkah berikutnya.",

        tone:
          "danger",
      };

    case "BREAK_EVEN":
      return {
        eyebrow:
          "Break Even",

        title:
          "Campaign berada tepat di sekitar titik impas.",

        description:
          "Contribution produk saat ini habis untuk menutup biaya iklan. Campaign belum memberikan ruang profit setelah seluruh biaya yang dimasukkan dihitung.",

        action:
          "Cari ruang profit terlebih dahulu sebelum menaikkan spend, misalnya melalui CPA lebih rendah atau ekonomi produk yang lebih kuat.",

        tone:
          "warning",
      };

    case "PROFITABLE":
      return {
        eyebrow:
          "Profitable",

        title:
          "Campaign menghasilkan estimasi profit positif.",

        description:
          "Contribution produk masih tersisa setelah biaya iklan dikurangi. Karena belum ada target profit, GOProfit hanya dapat menyatakan campaign menghasilkan estimasi profit positif.",

        action:
          "Tentukan target profit jika kamu ingin menilai apakah campaign bukan hanya profit, tetapi juga memenuhi standar profit tokomu.",

        tone:
          "success",
      };

    case "BELOW_TARGET":
      return {
        eyebrow:
          "Below Target",

        title:
          "Campaign profit, tetapi target profit belum tercapai.",

        description:
          "Campaign masih menghasilkan estimasi profit positif, tetapi jumlahnya berada di bawah target yang kamu tentukan. Jadi profitable belum tentu berarti target bisnis sudah terpenuhi.",

        action:
          "Fokus pada selisih terhadap target. Evaluasi CPA, total biaya iklan, fee, serta harga jual sebelum meningkatkan spend.",

        tone:
          "warning",
      };

    case "TARGET_MET":
      return {
        eyebrow:
          "Target Met",

        title:
          "Estimasi profit sudah memenuhi target yang kamu tentukan.",

        description:
          "Setelah HPP, fee, biaya operasional, dan biaya iklan dihitung, estimated profit masih sama dengan atau lebih besar dari target profit.",

        action:
          "Jika ingin meningkatkan spend, lakukan bertahap dan hitung ulang setelah biaya atau performa berubah. Status ini bukan jaminan hasil campaign berikutnya.",

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
          "GMV Ads berbeda dari ekonomi unit yang dihitung",

        description:
          "GMV atribusi marketplace tidak sama dengan pendapatan efektif berdasarkan harga, potongan, dan jumlah unit yang kamu masukkan. Pastikan periode, produk, unit terjual, harga, diskon, dan voucher berasal dari scope campaign yang sama.",
      };

    case "USING_PRESET_FEE":
      return {
        title:
          "Perhitungan menggunakan fee preset",

        description:
          "Pastikan fee preset masih sesuai dengan biaya yang benar-benar dikenakan pada tokomu.",
      };

    case "NO_CLICKS":
      return {
        title:
          "CPC tidak dapat dihitung",

        description:
          "Jumlah klik adalah 0, sehingga biaya per klik tidak memiliki denominator yang dapat digunakan.",
      };

    case "NO_ORDERS":
      return {
        title:
          "CPA dan profit per order tidak dapat dihitung",

        description:
          "Jumlah order adalah 0. GOProfit tetap dapat menghitung metrik campaign lain yang denominaturnya tersedia.",
      };

    case "NO_MEDIA_AD_SPEND":
      return {
        title:
          "Media ad spend adalah Rp0",

        description:
          "Reported ROAS tidak dapat dihitung dari media ad spend sebesar Rp0. Jika ada biaya iklan lain, Economic ROAS masih dapat berbeda.",
      };

    case "ATTRIBUTED_DATA_ESTIMATE":
      return {
        title:
          "GMV merupakan data atribusi",

        description:
          "GMV dari Ads mengikuti atribusi marketplace dan tidak otomatis sama dengan pendapatan final yang telah direkonsiliasi secara akuntansi.",
      };

    case "MULTI_UNIT_ORDER_ESTIMATE":
      return {
        title:
          "Orders dan units sold berbeda",

        description:
          "Satu order dapat berisi lebih dari satu unit. GOProfit menghitung biaya PER_UNIT dan PER_ORDER sesuai scope masing-masing, sehingga hasilnya merupakan estimasi berdasarkan angka yang kamu masukkan.",
      };

    case "LIVE_ATTRIBUTION_ESTIMATE":
      return {
        title: "Atribusi Shopee Live belum dirinci",
        description:
          "Input orders dan units dari Shopee Live belum tersedia, sehingga GOProfit menganggap seluruh orders dan units sebagai penjualan Live. Isi atribusi Live agar biaya Live XTRA tidak terlalu besar.",
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
