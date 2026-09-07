"use client";

import type {
    Dispatch,
    FormEvent,
    SetStateAction,
} from "react";

import {
    useRef,
    useState,
} from "react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { SaveCalculationButton } from "@/components/calculations/SaveCalculationButton";

import { checkAds } from "@/core/calculation/check-ads";
import { CALCULATION_RULE_VERSION } from "@/core/calculation/constants";

import type {
    CheckAdsInput,
    CheckAdsResult,
    ScenarioCost,
    ScenarioFee,
    SellerAdjustment,
    TargetProfit,
} from "@/domain/types";

import { CheckAdsResultPanel } from "./CheckAdsResultPanel";

import { FeeAndCostSection } from "@/features/plan-ads/components/FeeAndCostSection";
import { TargetProfitSection } from "@/features/plan-ads/components/TargetProfitSection";

type TargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

export function CheckAdsForm() {
  const [
    hpp,
    setHpp,
  ] =
    useState<number | null>(
      null,
    );

  const [
    listPrice,
    setListPrice,
  ] =
    useState<number | null>(
      null,
    );

  const [
    showDiscount,
    setShowDiscount,
  ] =
    useState(false);

  const [
    discount,
    setDiscount,
  ] =
    useState<number | null>(
      null,
    );

  const [
    showVoucher,
    setShowVoucher,
  ] =
    useState(false);

  const [
    voucher,
    setVoucher,
  ] =
    useState<number | null>(
      null,
    );

  const [
    adminFeeBps,
    setAdminFeeBps,
  ] =
    useState<number | null>(
      null,
    );

  const [
    processFee,
    setProcessFee,
  ] =
    useState<number | null>(
      null,
    );

  const [
    packingCost,
    setPackingCost,
  ] =
    useState<number | null>(
      null,
    );

  const [
    targetMode,
    setTargetMode,
  ] =
    useState<TargetProfitMode>(
      "NONE",
    );

  const [
    targetAmount,
    setTargetAmount,
  ] =
    useState<number | null>(
      null,
    );

  const [
    targetRateBps,
    setTargetRateBps,
  ] =
    useState<number | null>(
      null,
    );

  const [
    mediaAdSpend,
    setMediaAdSpend,
  ] =
    useState<number | null>(
      null,
    );

  const [
    additionalAdCost,
    setAdditionalAdCost,
  ] =
    useState<number | null>(
      null,
    );

  const [
    attributedGmv,
    setAttributedGmv,
  ] =
    useState<number | null>(
      null,
    );

  const [
    orders,
    setOrders,
  ] =
    useState<number | null>(
      null,
    );

  const [
    unitsSold,
    setUnitsSold,
  ] =
    useState<number | null>(
      null,
    );

  const [
    clicks,
    setClicks,
  ] =
    useState<number | null>(
      null,
    );

  const [
    result,
    setResult,
  ] =
    useState<CheckAdsResult | null>(
      null,
    );

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<CheckAdsInput | null>(null);

  const [
    formError,
    setFormError,
  ] =
    useState<string | null>(
      null,
    );

  const resultRef =
    useRef<HTMLDivElement>(
      null,
    );

  const targetReady =
    targetMode === "NONE" ||
    (targetMode ===
      "AMOUNT_PER_ORDER" &&
      targetAmount !== null) ||
    ((targetMode ===
      "NET_MARGIN_PERCENT" ||
      targetMode ===
        "HPP_MARKUP_PERCENT") &&
      targetRateBps !== null);

  const canCalculate =
    hpp !== null &&
    listPrice !== null &&
    mediaAdSpend !== null &&
    attributedGmv !== null &&
    orders !== null &&
    unitsSold !== null &&
    targetReady;

  function invalidateResult() {
    setResult(null);
    setCalculatedInput(null);
    setFormError(null);
  }

  function updateField<T>(
    setter: Dispatch<
      SetStateAction<T>
    >,
    value: T,
  ) {
    setter(value);
    invalidateResult();
  }

  function removeDiscount() {
    setDiscount(null);
    setShowDiscount(false);
    invalidateResult();
  }

  function removeVoucher() {
    setVoucher(null);
    setShowVoucher(false);
    invalidateResult();
  }

  function buildAdjustments():
    SellerAdjustment[] {
    const adjustments:
      SellerAdjustment[] = [];

    if (
      showDiscount &&
      discount !== null
    ) {
      adjustments.push({
        id:
          "product-discount",

        type:
          "PRODUCT_DISCOUNT",

        amount:
          discount,

        scope:
          "PER_UNIT",
      });
    }

    if (
      showVoucher &&
      voucher !== null
    ) {
      adjustments.push({
        id:
          "seller-voucher",

        type:
          "SELLER_VOUCHER",

        amount:
          voucher,

        scope:
          "PER_ORDER",
      });
    }

    return adjustments;
  }

  function buildFees():
    ScenarioFee[] {
    const fees:
      ScenarioFee[] = [];

    if (
      adminFeeBps !== null
    ) {
      fees.push({
        id:
          "marketplace-admin-fee",

        name:
          "Biaya Admin Marketplace",

        feeType:
          "PERCENTAGE",

        rateBps:
          adminFeeBps,

        calculationBase:
          "EFFECTIVE_SELLING_PRICE",

        scope:
          "PER_ORDER",

        source:
          "CUSTOM",

        active:
          true,
      });
    }

    if (
      processFee !== null
    ) {
      fees.push({
        id:
          "marketplace-process-fee",

        name:
          "Biaya Proses Pesanan",

        feeType:
          "FIXED",

        fixedAmount:
          processFee,

        calculationBase:
          "EFFECTIVE_SELLING_PRICE",

        scope:
          "PER_ORDER",

        source:
          "CUSTOM",

        active:
          true,
      });
    }

    return fees;
  }

  function buildCosts():
    ScenarioCost[] {
    if (
      packingCost === null
    ) {
      return [];
    }

    return [
      {
        id:
          "packing-cost",

        type:
          "PACKAGING",

        name:
          "Biaya Packing",

        amount:
          packingCost,

        scope:
          "PER_ORDER",
      },
    ];
  }

  function buildTargetProfit():
    | TargetProfit
    | null {
    if (
      targetMode === "NONE"
    ) {
      return {
        mode:
          "NONE",
      };
    }

    if (
      targetMode ===
      "AMOUNT_PER_ORDER"
    ) {
      if (
        targetAmount === null
      ) {
        return null;
      }

      return {
        mode:
          "AMOUNT_PER_ORDER",

        amount:
          targetAmount,
      };
    }

    if (
      targetRateBps === null
    ) {
      return null;
    }

    if (
      targetMode ===
      "NET_MARGIN_PERCENT"
    ) {
      return {
        mode:
          "NET_MARGIN_PERCENT",

        rateBps:
          targetRateBps,
      };
    }

    return {
      mode:
        "HPP_MARKUP_PERCENT",

      rateBps:
        targetRateBps,
    };
  }

  function validateForm():
    string | null {
    if (
      listPrice === null ||
      listPrice <= 0
    ) {
      return "Harga Normal harus lebih besar dari Rp0.";
    }

    if (
      hpp === null ||
      hpp < 0
    ) {
      return "Modal / HPP tidak boleh bernilai negatif.";
    }

    if (
      mediaAdSpend === null ||
      mediaAdSpend < 0
    ) {
      return "Ad Spend tidak boleh bernilai negatif.";
    }

    if (
      attributedGmv === null ||
      attributedGmv < 0
    ) {
      return "GMV dari Ads tidak boleh bernilai negatif.";
    }

    if (
      orders === null ||
      orders < 0
    ) {
      return "Jumlah order tidak valid.";
    }

    if (
      unitsSold === null ||
      unitsSold < 0
    ) {
      return "Jumlah unit terjual tidak valid.";
    }

    if (
      additionalAdCost !==
        null &&
      additionalAdCost < 0
    ) {
      return "Biaya iklan tambahan tidak boleh negatif.";
    }

    if (
      clicks !== null &&
      clicks < 0
    ) {
      return "Jumlah klik tidak boleh negatif.";
    }

    if (
      showDiscount &&
      discount !== null &&
      discount < 0
    ) {
      return "Diskon produk tidak valid.";
    }

    if (
      showVoucher &&
      voucher !== null &&
      voucher < 0
    ) {
      return "Voucher toko tidak valid.";
    }

    return null;
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    const error =
      validateForm();

    if (error) {
      setResult(null);
      setFormError(error);
      return;
    }

    const targetProfit =
      buildTargetProfit();

    if (!targetProfit) {
      setResult(null);

      setFormError(
        "Lengkapi nilai Target Profit yang kamu pilih.",
      );

      return;
    }

    if (
      hpp === null ||
      listPrice === null ||
      mediaAdSpend === null ||
      attributedGmv === null ||
      orders === null ||
      unitsSold === null
    ) {
      return;
    }

    const input:
      CheckAdsInput = {
      economics: {
        marketplace:
          "SHOPEE",

        currencyCode:
          "IDR",

        listPrice,

        hppPerUnit:
          hpp,

        adjustments:
          buildAdjustments(),

        fees:
          buildFees(),

        costs:
          buildCosts(),

        targetProfit,

        calculationRuleVersion:
          CALCULATION_RULE_VERSION,
      },

      campaign: {
        mediaAdSpend,

        additionalAdCost:
          additionalAdCost ??
          0,

        attributedGmv,

        orders,

        unitsSold,

        ...(clicks !== null
          ? {
              clicks,
            }
          : {}),
      },

      calculationRuleVersion:
        CALCULATION_RULE_VERSION,
    };

    try {
      const calculation =
        checkAds(input);

      setResult(
        calculation,
      );
      setCalculatedInput(input);

      window.requestAnimationFrame(
        () => {
          resultRef.current?.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "start",
            },
          );
        },
      );
    } catch {
      setResult(null);

      setFormError(
        "Ada data yang belum valid. Periksa kembali harga, biaya, target, dan data iklan.",
      );
    }
  }

  return (
    <>
      <form
      onSubmit={
        handleSubmit
      }
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="space-y-6">
        <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
          <div className="border-b border-[var(--gp-border)] pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
              1. Ekonomi Produk
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
              Berapa ekonomi produk yang diiklankan?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
              Masukkan harga dan
              modal produk yang
              sama dengan produk
              pada campaign yang
              ingin dianalisis.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <CurrencyInput
              id="check-hpp"
              label="Modal / HPP"
              value={hpp}
              onValueChange={(
                value,
              ) =>
                updateField(
                  setHpp,
                  value,
                )
              }
              placeholder="Rp80.000"
              helperText="Modal untuk satu unit produk."
              required
            />

            <CurrencyInput
              id="check-list-price"
              label="Harga Normal"
              value={
                listPrice
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setListPrice,
                  value,
                )
              }
              placeholder="Rp150.000"
              helperText="Harga normal untuk satu unit."
              required
            />
          </div>

          <div className="mt-7 border-t border-[var(--gp-border)] pt-6">
            <p className="text-sm font-semibold">
              Ada potongan dari
              seller?
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--gp-text-muted)]">
              Tambahkan hanya
              diskon atau voucher
              yang memang
              ditanggung tokomu.
            </p>

            <div className="mt-4 space-y-4">
              {!showDiscount ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscount(
                      true,
                    );

                    invalidateResult();
                  }}
                  className="text-sm font-semibold text-[var(--gp-brand-primary)]"
                >
                  + Tambahkan
                  diskon produk
                </button>
              ) : (
                <div className="rounded-xl bg-[var(--gp-surface-soft)] p-4">
                  <CurrencyInput
                    id="check-product-discount"
                    label="Diskon Produk"
                    value={
                      discount
                    }
                    onValueChange={(
                      value,
                    ) =>
                      updateField(
                        setDiscount,
                        value,
                      )
                    }
                    placeholder="Rp10.000"
                  />

                  <button
                    type="button"
                    onClick={
                      removeDiscount
                    }
                    className="mt-3 text-xs font-semibold text-[var(--gp-danger)]"
                  >
                    Hapus diskon
                  </button>
                </div>
              )}

              {!showVoucher ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowVoucher(
                      true,
                    );

                    invalidateResult();
                  }}
                  className="block text-sm font-semibold text-[var(--gp-brand-primary)]"
                >
                  + Tambahkan
                  voucher toko
                </button>
              ) : (
                <div className="rounded-xl bg-[var(--gp-surface-soft)] p-4">
                  <CurrencyInput
                    id="check-seller-voucher"
                    label="Voucher Toko"
                    value={
                      voucher
                    }
                    onValueChange={(
                      value,
                    ) =>
                      updateField(
                        setVoucher,
                        value,
                      )
                    }
                    placeholder="Rp5.000"
                    helperText="Voucher yang ditanggung seller."
                  />

                  <button
                    type="button"
                    onClick={
                      removeVoucher
                    }
                    className="mt-3 text-xs font-semibold text-[var(--gp-danger)]"
                  >
                    Hapus voucher
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <FeeAndCostSection
          adminFeeBps={
            adminFeeBps
          }
          onAdminFeeChange={(
            value,
          ) =>
            updateField(
              setAdminFeeBps,
              value,
            )
          }
          processFee={
            processFee
          }
          onProcessFeeChange={(
            value,
          ) =>
            updateField(
              setProcessFee,
              value,
            )
          }
          packingCost={
            packingCost
          }
          onPackingCostChange={(
            value,
          ) =>
            updateField(
              setPackingCost,
              value,
            )
          }
        />

        <TargetProfitSection
          mode={
            targetMode
          }
          onModeChange={(
            value,
          ) =>
            updateField(
              setTargetMode,
              value,
            )
          }
          amount={
            targetAmount
          }
          onAmountChange={(
            value,
          ) =>
            updateField(
              setTargetAmount,
              value,
            )
          }
          rateBps={
            targetRateBps
          }
          onRateChange={(
            value,
          ) =>
            updateField(
              setTargetRateBps,
              value,
            )
          }
        />

        <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
          <div className="border-b border-[var(--gp-border)] pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
              4. Performa Iklan
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
              Masukkan hasil campaign
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
              Gunakan data pada
              periode campaign
              yang sama agar
              estimasi profit
              tidak tercampur
              antarperiode.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <CurrencyInput
              id="check-media-ad-spend"
              label="Ad Spend"
              value={
                mediaAdSpend
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setMediaAdSpend,
                  value,
                )
              }
              placeholder="Rp100.000"
              helperText="Biaya iklan yang tercatat pada marketplace."
              required
            />

            <CurrencyInput
              id="check-attributed-gmv"
              label="GMV dari Ads"
              value={
                attributedGmv
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setAttributedGmv,
                  value,
                )
              }
              placeholder="Rp750.000"
              helperText="GMV yang diatribusikan marketplace ke iklan."
              required
            />

            <NumberInput
              id="check-orders"
              label="Orders"
              value={
                orders
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setOrders,
                  value,
                )
              }
              placeholder="5"
              helperText="Jumlah pesanan dari campaign."
              required
            />

            <NumberInput
              id="check-units-sold"
              label="Units Sold"
              value={
                unitsSold
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setUnitsSold,
                  value,
                )
              }
              placeholder="5"
              helperText="Boleh lebih besar dari Orders jika satu pesanan berisi beberapa unit."
              required
            />

            <NumberInput
              id="check-clicks"
              label="Clicks (Opsional)"
              value={
                clicks
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setClicks,
                  value,
                )
              }
              placeholder="120"
              helperText="Jika diisi, GOProfit juga menghitung CPC."
            />

            <CurrencyInput
              id="check-additional-ad-cost"
              label="Biaya Iklan Tambahan (Opsional)"
              value={
                additionalAdCost
              }
              onValueChange={(
                value,
              ) =>
                updateField(
                  setAdditionalAdCost,
                  value,
                )
              }
              placeholder="Rp0"
              helperText="Biaya campaign lain di luar media ad spend. Kosong dianggap Rp0."
            />
          </div>

          <div className="mt-5 rounded-xl bg-[var(--gp-brand-soft)] p-4">
            <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
              GOProfit membedakan
              ROAS yang dilaporkan
              marketplace dari
              Economic ROAS jika
              ada biaya iklan
              tambahan.
            </p>
          </div>
        </section>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--gp-danger)] bg-[var(--gp-danger-soft)] p-4"
          >
            <p className="text-sm font-semibold text-[var(--gp-danger)]">
              Periksa kembali
              inputmu
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
              {formError}
            </p>
          </div>
        )}

        <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
          <button
            type="submit"
            disabled={
              !canCalculate
            }
            className={[
              "flex min-h-12 w-full items-center justify-center rounded-[var(--gp-radius-button)] px-6",
              "text-sm font-bold transition",
              canCalculate
                ? "bg-[var(--gp-brand-primary)] text-white hover:bg-[var(--gp-brand-hover)]"
                : "cursor-not-allowed bg-[var(--gp-border)] text-[var(--gp-text-muted)]",
            ].join(" ")}
          >
            Analisis Iklan Saya
          </button>

          <p className="mt-3 text-center text-[11px] leading-5 text-[var(--gp-text-muted)]">
            Hasil merupakan
            estimasi berdasarkan
            ekonomi produk dan
            data campaign yang
            kamu masukkan.
          </p>
        </section>
      </div>

      <aside
        ref={
          resultRef
        }
      >
        <div className="sticky top-6">
          {result ? (
            <CheckAdsPreview
              result={
                result
              }
            />
          ) : (
            <CheckInitialSummary />
          )}
        </div>
      </aside>
      </form>

    {result && calculatedInput && (
      <section className="mx-auto mt-8 max-w-[1180px]">
        <CheckAdsResultPanel result={result} input={calculatedInput} />
        <div className="mt-4 max-w-[360px]">
          <SaveCalculationButton
            kind="CHECK"
            planInput={calculatedInput.economics}
            checkInput={calculatedInput}
            checkResult={result}
          />
        </div>
      </section>
      )}
    </>
  );
}

function CheckInitialSummary() {
  return (
    <div className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Check My Ads
      </p>

      <h2 className="mt-2 text-lg font-bold">
        ROAS saja belum cukup
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
        GOProfit akan
        memperkirakan apakah
        campaign benar-benar
        menghasilkan profit
        setelah biaya iklan.
      </p>

      <div className="mt-5 space-y-4">
        <SummaryItem
          title="Estimated Profit After Ads"
          description="Sisa contribution setelah total biaya iklan."
        />

        <SummaryItem
          title="ROAS & ACOS"
          description="Bandingkan metrik marketplace dengan ekonomi sebenarnya."
        />

        <SummaryItem
          title="CPA & CPC"
          description="Lihat biaya per order dan per klik jika datanya tersedia."
        />

        <SummaryItem
          title="Target Profit"
          description="Cek apakah hasil campaign sudah mencapai targetmu."
        />
      </div>
    </div>
  );
}

function CheckAdsPreview({
  result,
}: {
  result: CheckAdsResult;
}) {
  return (
    <div className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Estimated Result
      </p>

      <p className="mt-3 text-xs font-semibold text-[var(--gp-text-secondary)]">
        Estimated Profit After Ads
      </p>

      <p className="mt-1 text-4xl font-bold tracking-[-0.06em] text-[var(--gp-text-primary)]">
        {formatMoney(
          result.estimatedProfitAfterAds,
        )}
      </p>

      <div className="mt-4 rounded-xl bg-[var(--gp-surface-soft)] p-3">
        <p className="text-xs font-bold">
          {formatDiagnosis(
            result.diagnosis,
          )}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <MetricRow
          label="Reported ROAS"
          value={
            formatRoas(
              result.reportedRoas,
            )
          }
        />

        <MetricRow
          label="Economic ROAS"
          value={
            formatRoas(
              result.economicRoas,
            )
          }
        />

        <MetricRow
          label="Economic ACOS"
          value={
            formatBps(
              result.economicAcosBps,
            )
          }
        />

        <MetricRow
          label="CPA"
          value={
            formatOptionalMoney(
              result.cpa,
            )
          }
        />

        <MetricRow
          label="CPC"
          value={
            formatOptionalMoney(
              result.cpc,
            )
          }
        />

        <MetricRow
          label="Profit / Order"
          value={
            formatOptionalMoney(
              result.estimatedProfitPerOrder,
            )
          }
        />
      </div>

      {result.warnings.length >
        0 && (
        <div className="mt-5 rounded-xl bg-[var(--gp-brand-soft)] p-4">
          <p className="text-xs font-semibold">
            {
              result.warnings
                .length
            }{" "}
            catatan perhitungan
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
            Detail diagnosis dan
            penjelasan warning
            akan ditampilkan pada
            tahap berikutnya.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--gp-border)] pb-4 last:border-0 last:pb-0">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
        {description}
      </p>
    </div>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--gp-border)] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-[var(--gp-text-secondary)]">
        {label}
      </span>

      <strong className="text-right text-sm">
        {value}
      </strong>
    </div>
  );
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

function formatDiagnosis(
  diagnosis:
    CheckAdsResult["diagnosis"],
): string {
  switch (diagnosis) {
    case "LOSS":
      return "Campaign masih rugi";

    case "BREAK_EVEN":
      return "Campaign berada di titik impas";

    case "PROFITABLE":
      return "Campaign menghasilkan profit";

    case "BELOW_TARGET":
      return "Profit positif, tetapi belum mencapai target";

    case "TARGET_MET":
      return "Target profit tercapai";
  }
}
