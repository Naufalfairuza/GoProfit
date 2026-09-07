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
import { SaveCalculationButton } from "@/components/calculations/SaveCalculationButton";

import {
  CALCULATION_RULE_VERSION,
  planAds,
  validatePlanInput,
} from "@/core/calculation";

import type {
  PlanAdsInput,
  PlanAdsResult,
  ScenarioCost,
  ScenarioFee,
  SellerAdjustment,
  TargetProfit,
} from "@/domain/types";

import { ScenarioWorkspace } from "@/features/scenario/components/ScenarioWorkspace";

import { FeeAndCostSection } from "./FeeAndCostSection";
import { PlanAdsResultPanel } from "./PlanAdsResultPanel";
import { TargetProfitSection } from "./TargetProfitSection";

type TargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

export function PlanAdsForm() {
  const [hpp, setHpp] =
    useState<number | null>(null);

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
    result,
    setResult,
  ] =
    useState<PlanAdsResult | null>(
      null,
    );

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<PlanAdsInput | null>(
      null,
    );

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

  const targetValueReady =
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
    targetValueReady;

  function invalidateCalculation() {
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
    invalidateCalculation();
  }

  function removeDiscount() {
    setDiscount(null);
    setShowDiscount(false);
    invalidateCalculation();
  }

  function removeVoucher() {
    setVoucher(null);
    setShowVoucher(false);
    invalidateCalculation();
  }

  function buildTargetProfit():
    | TargetProfit
    | null {
    if (
      targetMode === "NONE"
    ) {
      return {
        mode: "NONE",
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
    const costs:
      ScenarioCost[] = [];

    if (
      packingCost !== null
    ) {
      costs.push({
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
      });
    }

    return costs;
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);

    if (hpp === null) {
      setResult(null);
      setCalculatedInput(null);

      setFormError(
        "Masukkan Modal / HPP terlebih dahulu.",
      );

      return;
    }

    if (
      listPrice === null
    ) {
      setResult(null);
      setCalculatedInput(null);

      setFormError(
        "Masukkan Harga Normal terlebih dahulu.",
      );

      return;
    }

    const targetProfit =
      buildTargetProfit();

    if (!targetProfit) {
      setResult(null);
      setCalculatedInput(null);

      setFormError(
        "Lengkapi nilai Target Profit yang kamu pilih.",
      );

      return;
    }

    const input:
      PlanAdsInput = {
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
    };

    const validation =
      validatePlanInput(input);

    if (!validation.valid) {
      const issue =
        validation.issues[0];

      setResult(null);
      setCalculatedInput(null);

      setFormError(
        getValidationMessage(
          issue.code,
        ),
      );

      return;
    }

    const calculationResult =
      planAds(input);

    setCalculatedInput(input);

    setResult(
      calculationResult,
    );

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
  }

  return (
    <>
      <form
        onSubmit={
          handleSubmit
        }
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
            <div className="border-b border-[var(--gp-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
                1. Produk & Harga
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                Masukkan ekonomi
                produkmu
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
                Mulai dari modal
                dan harga jual.
                Nama produk tidak
                wajib untuk
                melakukan
                perhitungan.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <CurrencyInput
                id="hpp"
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
                helperText="Modal produk untuk satu unit."
                required
              />

              <CurrencyInput
                id="list-price"
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
                helperText="Harga sebelum diskon atau voucher toko."
                required
              />
            </div>

            <div className="mt-7 border-t border-[var(--gp-border)] pt-6">
              <p className="text-sm font-semibold">
                Ada potongan dari
                tokomu?
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--gp-text-muted)]">
                Tambahkan hanya
                potongan yang
                benar-benar
                mengurangi
                pendapatan tokomu.
              </p>

              <div className="mt-4 space-y-4">
                {!showDiscount ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiscount(
                        true,
                      );

                      invalidateCalculation();
                    }}
                    className="text-sm font-semibold text-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-hover)]"
                  >
                    + Tambahkan
                    diskon produk
                  </button>
                ) : (
                  <div className="rounded-xl bg-[var(--gp-surface-soft)] p-4">
                    <CurrencyInput
                      id="product-discount"
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

                      invalidateCalculation();
                    }}
                    className="block text-sm font-semibold text-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-hover)]"
                  >
                    + Tambahkan
                    voucher toko
                  </button>
                ) : (
                  <div className="rounded-xl bg-[var(--gp-surface-soft)] p-4">
                    <CurrencyInput
                      id="seller-voucher"
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
                      helperText="Masukkan voucher yang ditanggung oleh tokomu."
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
            mode={targetMode}
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
              Hitung ROAS Saya
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-[var(--gp-text-muted)]">
              GOProfit menghitung
              berdasarkan angka yang
              kamu masukkan. Tidak
              ada biaya atau asumsi
              marketplace yang
              ditambahkan secara
              tersembunyi.
            </p>
          </section>
        </div>

        <aside ref={resultRef}>
          <div className="sticky top-6">
            {result ? (
              <div className="space-y-3">
                <PlanAdsResultPanel result={result} />
                {calculatedInput && (
                  <SaveCalculationButton
                    kind="PLAN"
                    planInput={calculatedInput}
                    planResult={result}
                  />
                )}
              </div>
            ) : (
              <InitialSummary />
            )}
          </div>
        </aside>
      </form>

      {result &&
        calculatedInput && (
          <ScenarioWorkspace
            baseInput={
              calculatedInput
            }
            baseResult={
              result
            }
          />
        )}
    </>
  );
}

function InitialSummary() {
  return (
    <div className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        GOProfit
      </p>

      <h2 className="mt-2 text-lg font-bold">
        Yang akan kita hitung
      </h2>

      <div className="mt-5 space-y-4 text-sm">
        <SummaryItem
          title="Profit sebelum iklan"
          description="Sisa setelah modal, fee, dan biaya."
        />

        <SummaryItem
          title="ROAS BEP"
          description="Titik impas biaya iklanmu."
        />

        <SummaryItem
          title="Minimum ROAS Aman"
          description="Berdasarkan target profit yang kamu pilih."
        />
      </div>

      <div className="mt-6 rounded-xl bg-[var(--gp-brand-soft)] p-4">
        <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
          Lengkapi data di
          sebelah kiri kemudian
          klik Hitung ROAS Saya
          untuk melihat hasilnya.
        </p>
      </div>
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
      <p className="font-semibold text-[var(--gp-text-primary)]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
        {description}
      </p>
    </div>
  );
}

function getValidationMessage(
  code: string,
): string {
  switch (code) {
    case "LIST_PRICE_INVALID":
      return "Harga Normal harus lebih besar dari Rp0.";

    case "HPP_INVALID":
      return "Modal / HPP tidak boleh bernilai negatif.";

    case "ADJUSTMENT_INVALID":
      return "Diskon atau voucher tidak boleh bernilai negatif.";

    case "DISCOUNT_EXCEEDS_PRICE":
      return "Diskon produk tidak boleh lebih besar dari Harga Normal.";

    case "EFFECTIVE_PRICE_NON_POSITIVE":
      return "Total diskon dan voucher membuat harga efektif menjadi Rp0 atau negatif.";

    case "FEE_RATE_INVALID":
      return "Persentase biaya marketplace tidak valid.";

    case "FIXED_FEE_INVALID":
      return "Biaya proses pesanan tidak valid.";

    case "COST_INVALID":
      return "Biaya operasional tidak valid.";

    case "TARGET_AMOUNT_INVALID":
      return "Target profit Rupiah tidak valid.";

    case "TARGET_RATE_INVALID":
      return "Persentase target profit tidak valid.";

    default:
      return "Ada data yang belum valid. Periksa kembali angka yang kamu masukkan.";
  }
}
