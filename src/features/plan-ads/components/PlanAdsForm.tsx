"use client";

import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SaveCalculationButton } from "@/components/calculations/SaveCalculationButton";
import { ExportShareActions } from "@/components/calculations/ExportShareActions";
import { AnimatedResult } from "@/components/ui/MotionPrimitives";

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

import {
  areShopeeProgramDraftsReady,
  buildShopeeProgramFees,
  createShopeeProgramDrafts,
  restoreShopeeProgramDrafts,
  updateShopeeProgramDrafts,
} from "@/config/marketplaces/shopee-programs";
import type {
  ShopeeProgramDraft,
  ShopeeProgramId,
} from "@/config/marketplaces/shopee-programs";
import { BrowserScenarioRepository } from "@/services/persistence/browser-scenario.repository";

import { ScenarioWorkspace } from "@/features/scenario/components/ScenarioWorkspace";

import { FeeAndCostSection } from "./FeeAndCostSection";
import { PlanAdsResultPanel } from "./PlanAdsResultPanel";
import { TargetProfitSection } from "./TargetProfitSection";

type TargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

const PLAN_SESSION_KEY = "goprofit.plan-session.v1";

interface PlanSessionSnapshot {
  input: PlanAdsInput;
  result: PlanAdsResult;
}

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

  const [programs, setPrograms] = useState<ShopeeProgramDraft[]>(
    createShopeeProgramDrafts,
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

  const [restoredFromSession, setRestoredFromSession] = useState(false);

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
    targetValueReady &&
    areShopeeProgramDraftsReady(programs);

  const hasAnyInput =
    hpp !== null ||
    listPrice !== null ||
    discount !== null ||
    voucher !== null ||
    adminFeeBps !== null ||
    processFee !== null ||
    packingCost !== null ||
    programs.some((program) => program.enabled) ||
    targetMode !== "NONE" ||
    result !== null;

  function applyPlanSnapshot(
    input: PlanAdsInput,
    savedResult?: PlanAdsResult,
  ) {
      const productDiscount = input.adjustments.find(
        (adjustment) => adjustment.type === "PRODUCT_DISCOUNT",
      );
      const sellerVoucher = input.adjustments.find(
        (adjustment) => adjustment.type === "SELLER_VOUCHER",
      );
      const adminFee = input.fees.find(
        (fee) => fee.id === "marketplace-admin-fee",
      );
      const processFee = input.fees.find(
        (fee) => fee.id === "marketplace-process-fee",
      );
      const packing = input.costs.find(
        (cost) => cost.id === "packing-cost",
      );

      setHpp(input.hppPerUnit);
      setListPrice(input.listPrice);
      setShowDiscount(Boolean(productDiscount));
      setDiscount(productDiscount?.amount ?? null);
      setShowVoucher(Boolean(sellerVoucher));
      setVoucher(sellerVoucher?.amount ?? null);
      setAdminFeeBps(adminFee?.rateBps ?? null);
      setProcessFee(processFee?.fixedAmount ?? null);
      setPackingCost(packing?.amount ?? null);
      setPrograms(restoreShopeeProgramDrafts(input.fees));

      switch (input.targetProfit.mode) {
        case "NONE":
          setTargetMode("NONE");
          setTargetAmount(null);
          setTargetRateBps(null);
          break;
        case "AMOUNT_PER_ORDER":
          setTargetMode("AMOUNT_PER_ORDER");
          setTargetAmount(input.targetProfit.amount);
          setTargetRateBps(null);
          break;
        case "NET_MARGIN_PERCENT":
          setTargetMode("NET_MARGIN_PERCENT");
          setTargetAmount(null);
          setTargetRateBps(input.targetProfit.rateBps);
          break;
        case "HPP_MARKUP_PERCENT":
          setTargetMode("HPP_MARKUP_PERCENT");
          setTargetAmount(null);
          setTargetRateBps(input.targetProfit.rateBps);
          break;
      }

      setCalculatedInput(input);
      setResult(savedResult ?? planAds(input));
      setFormError(null);
  }

  useEffect(() => {
    const restoreId = new URLSearchParams(window.location.search).get("restore");
    let cancelled = false;

    if (!restoreId) {
      const rawSnapshot = window.sessionStorage.getItem(PLAN_SESSION_KEY);

      if (rawSnapshot) {
        try {
          const snapshot = JSON.parse(rawSnapshot) as PlanSessionSnapshot;
          window.queueMicrotask(() => {
            if (cancelled) return;
            applyPlanSnapshot(snapshot.input, snapshot.result);
            setRestoredFromSession(true);
          });
        } catch {
          window.sessionStorage.removeItem(PLAN_SESSION_KEY);
        }
      }

      return () => {
        cancelled = true;
      };
    }

    const repository = new BrowserScenarioRepository();

    void repository.get(restoreId).then((saved) => {
      if (cancelled || !saved || saved.kind !== "PLAN") return;

      const snapshot: PlanSessionSnapshot = {
        input: saved.planInput,
        result: saved.planResult ?? planAds(saved.planInput),
      };

      applyPlanSnapshot(snapshot.input, snapshot.result);
      setRestoredFromSession(false);
      window.sessionStorage.setItem(PLAN_SESSION_KEY, JSON.stringify(snapshot));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function invalidateCalculation() {
    setResult(null);
    setCalculatedInput(null);
    setFormError(null);
    setRestoredFromSession(false);
    window.sessionStorage.removeItem(PLAN_SESSION_KEY);
  }

  function resetForm() {
    setHpp(null);
    setListPrice(null);
    setShowDiscount(false);
    setDiscount(null);
    setShowVoucher(false);
    setVoucher(null);
    setAdminFeeBps(null);
    setProcessFee(null);
    setPackingCost(null);
    setPrograms(createShopeeProgramDrafts());
    setTargetMode("NONE");
    setTargetAmount(null);
    setTargetRateBps(null);
    setResult(null);
    setCalculatedInput(null);
    setFormError(null);
    setRestoredFromSession(false);
    window.sessionStorage.removeItem(PLAN_SESSION_KEY);
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

  function updateProgram(
    id: ShopeeProgramId,
    patch: Partial<ShopeeProgramDraft>,
  ) {
    setPrograms((current) => updateShopeeProgramDrafts(current, id, patch));
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

    return [...fees, ...buildShopeeProgramFees(programs)];
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
        "Masukkan harga jual terlebih dahulu.",
      );

      return;
    }

    if (!areShopeeProgramDraftsReady(programs)) {
      setResult(null);
      setCalculatedInput(null);
      setFormError("Lengkapi persentase program Shopee yang diaktifkan.");
      return;
    }

    const targetProfit =
      buildTargetProfit();

    if (!targetProfit) {
      setResult(null);
      setCalculatedInput(null);

      setFormError(
        "Lengkapi nilai target untung yang kamu pilih.",
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
    setRestoredFromSession(false);

    window.sessionStorage.setItem(
      PLAN_SESSION_KEY,
      JSON.stringify({
        input,
        result: calculationResult,
      } satisfies PlanSessionSnapshot),
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
                helperText="Modal untuk satu barang."
                required
              />

              <CurrencyInput
                id="list-price"
                label="Harga jual"
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
            programs={programs}
            onProgramChange={updateProgram}
            idPrefix="plan-program"
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
            {restoredFromSession && (
              <div className="mb-4 rounded-xl border border-[var(--gp-info)] bg-[var(--gp-info-soft)] p-3">
                <p className="text-xs font-bold text-[var(--gp-info)]">
                  Perhitungan terakhir dipulihkan
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
                  Hasil tetap disimpan selama tab browser ini masih aktif. Klik
                  &quot;Mulai ulang&quot; jika ingin membuat perhitungan baru.
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <button
                type="submit"
                disabled={!canCalculate}
                className={[
                  "flex min-h-12 w-full items-center justify-center rounded-[var(--gp-radius-button)] px-6",
                  "text-sm font-bold transition",
                  canCalculate
                    ? "bg-[var(--gp-brand-primary)] text-white hover:-translate-y-0.5 hover:bg-[var(--gp-brand-hover)] hover:shadow-[0_8px_20px_rgba(244,90,53,0.22)]"
                    : "cursor-not-allowed bg-[var(--gp-border)] text-[var(--gp-text-muted)]",
                ].join(" ")}
              >
                Hitung ROAS Saya
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={!hasAnyInput}
                className="min-h-12 rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] px-5 text-sm font-bold text-[var(--gp-text-secondary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mulai ulang
              </button>
            </div>

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
              <AnimatedResult>
                <div className="space-y-3">
                  <PlanAdsResultPanel result={result} />
                  {calculatedInput && (
                    <>
                      <SaveCalculationButton
                        kind="PLAN"
                        planInput={calculatedInput}
                        planResult={result}
                      />
                      <ExportShareActions
                        kind="PLAN"
                        planResult={result}
                      />
                    </>
                  )}
                </div>
              </AnimatedResult>
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
          title="Untung sebelum iklan"
          description="Sisa setelah modal, fee, dan biaya."
        />

        <SummaryItem
          title="ROAS BEP"
          description="Titik impas biaya iklanmu."
        />

        <SummaryItem
          title="Minimum ROAS Aman"
          description="Berdasarkan target untung yang kamu pilih."
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
      return "Harga jual harus lebih besar dari Rp0.";

    case "HPP_INVALID":
      return "Modal / HPP tidak boleh bernilai negatif.";

    case "ADJUSTMENT_INVALID":
      return "Diskon atau voucher tidak boleh bernilai negatif.";

    case "DISCOUNT_EXCEEDS_PRICE":
      return "Diskon produk tidak boleh lebih besar dari harga jual.";

    case "EFFECTIVE_PRICE_NON_POSITIVE":
      return "Total diskon dan voucher membuat harga efektif menjadi Rp0 atau negatif.";

    case "FEE_RATE_INVALID":
      return "Persentase biaya marketplace tidak valid.";

    case "FEE_CAP_INVALID":
      return "Batas biaya per unit tidak valid.";

    case "FIXED_FEE_INVALID":
      return "Biaya proses pesanan tidak valid.";

    case "COST_INVALID":
      return "Biaya operasional tidak valid.";

    case "TARGET_AMOUNT_INVALID":
      return "Target untung dalam Rupiah tidak valid.";

    case "TARGET_RATE_INVALID":
      return "Persentase target untung tidak valid.";

    default:
      return "Ada data yang belum valid. Periksa kembali angka yang kamu masukkan.";
  }
}
