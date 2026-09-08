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
import { NumberInput } from "@/components/ui/NumberInput";
import { SaveCalculationButton } from "@/components/calculations/SaveCalculationButton";
import { ExportShareActions } from "@/components/calculations/ExportShareActions";
import { AnimatedResult } from "@/components/ui/MotionPrimitives";

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

import { CheckAdsResultPanel } from "./CheckAdsResultPanel";
import { ShopeeValidationPanel } from "./ShopeeValidationPanel";

import { FeeAndCostSection } from "@/features/plan-ads/components/FeeAndCostSection";
import { TargetProfitSection } from "@/features/plan-ads/components/TargetProfitSection";

type TargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

const CHECK_SESSION_KEY = "goprofit.check-session.v1";

interface CheckSessionSnapshot {
  input: CheckAdsInput;
  result: CheckAdsResult;
}

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
    liveOrders,
    setLiveOrders,
  ] = useState<number | null>(null);

  const [
    liveUnitsSold,
    setLiveUnitsSold,
  ] = useState<number | null>(null);

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

  const [restoredFromSession, setRestoredFromSession] = useState(false);

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

  const liveProgramEnabled = programs.some(
    (program) => program.id === "shopee-live-xtra" && program.enabled,
  );
  const liveAttributionReady =
    !liveProgramEnabled ||
    (liveOrders !== null && liveUnitsSold !== null);

  const canCalculate =
    hpp !== null &&
    listPrice !== null &&
    mediaAdSpend !== null &&
    attributedGmv !== null &&
    orders !== null &&
    unitsSold !== null &&
    targetReady &&
    liveAttributionReady &&
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
    mediaAdSpend !== null ||
    additionalAdCost !== null ||
    attributedGmv !== null ||
    orders !== null ||
    unitsSold !== null ||
    liveOrders !== null ||
    liveUnitsSold !== null ||
    clicks !== null ||
    result !== null;

  function applyCheckSnapshot(
    input: CheckAdsInput,
    savedResult?: CheckAdsResult,
  ) {
      const economics = input.economics;
      const productDiscount = economics.adjustments.find(
        (adjustment) => adjustment.type === "PRODUCT_DISCOUNT",
      );
      const sellerVoucher = economics.adjustments.find(
        (adjustment) => adjustment.type === "SELLER_VOUCHER",
      );
      const adminFee = economics.fees.find(
        (fee) => fee.id === "marketplace-admin-fee",
      );
      const processFee = economics.fees.find(
        (fee) => fee.id === "marketplace-process-fee",
      );
      const packing = economics.costs.find(
        (cost) => cost.id === "packing-cost",
      );

      setHpp(economics.hppPerUnit);
      setListPrice(economics.listPrice);
      setShowDiscount(Boolean(productDiscount));
      setDiscount(productDiscount?.amount ?? null);
      setShowVoucher(Boolean(sellerVoucher));
      setVoucher(sellerVoucher?.amount ?? null);
      setAdminFeeBps(adminFee?.rateBps ?? null);
      setProcessFee(processFee?.fixedAmount ?? null);
      setPackingCost(packing?.amount ?? null);
      setPrograms(restoreShopeeProgramDrafts(economics.fees));

      switch (economics.targetProfit.mode) {
        case "NONE":
          setTargetMode("NONE");
          setTargetAmount(null);
          setTargetRateBps(null);
          break;
        case "AMOUNT_PER_ORDER":
          setTargetMode("AMOUNT_PER_ORDER");
          setTargetAmount(economics.targetProfit.amount);
          setTargetRateBps(null);
          break;
        case "NET_MARGIN_PERCENT":
          setTargetMode("NET_MARGIN_PERCENT");
          setTargetAmount(null);
          setTargetRateBps(economics.targetProfit.rateBps);
          break;
        case "HPP_MARKUP_PERCENT":
          setTargetMode("HPP_MARKUP_PERCENT");
          setTargetAmount(null);
          setTargetRateBps(economics.targetProfit.rateBps);
          break;
      }

      setMediaAdSpend(input.campaign.mediaAdSpend);
      setAdditionalAdCost(input.campaign.additionalAdCost);
      setAttributedGmv(input.campaign.attributedGmv);
      setOrders(input.campaign.orders);
      setUnitsSold(input.campaign.unitsSold);
      setLiveOrders(
        input.campaign.liveOrders ??
          (economics.fees.some(
            (fee) => fee.id === "shopee-program-shopee-live-xtra",
          )
            ? input.campaign.orders
            : null),
      );
      setLiveUnitsSold(
        input.campaign.liveUnitsSold ??
          (economics.fees.some(
            (fee) => fee.id === "shopee-program-shopee-live-xtra",
          )
            ? input.campaign.unitsSold
            : null),
      );
      setClicks(input.campaign.clicks ?? null);
      setCalculatedInput(input);
      setResult(savedResult ?? checkAds(input));
      setFormError(null);
  }

  useEffect(() => {
    const restoreId = new URLSearchParams(window.location.search).get("restore");
    let cancelled = false;

    if (!restoreId) {
      const rawSnapshot = window.sessionStorage.getItem(CHECK_SESSION_KEY);

      if (rawSnapshot) {
        try {
          const snapshot = JSON.parse(rawSnapshot) as CheckSessionSnapshot;
          window.queueMicrotask(() => {
            if (cancelled) return;
            applyCheckSnapshot(snapshot.input, snapshot.result);
            setRestoredFromSession(true);
          });
        } catch {
          window.sessionStorage.removeItem(CHECK_SESSION_KEY);
        }
      }

      return () => {
        cancelled = true;
      };
    }

    const repository = new BrowserScenarioRepository();

    void repository.get(restoreId).then((saved) => {
      if (cancelled || !saved || saved.kind !== "CHECK") return;

      if (!saved.checkInput) {
        setFormError(
          "Snapshot lama belum menyimpan data campaign. Buat perhitungan baru.",
        );
        return;
      }

      const snapshot: CheckSessionSnapshot = {
        input: saved.checkInput,
        result: saved.checkResult ?? checkAds(saved.checkInput),
      };

      applyCheckSnapshot(snapshot.input, snapshot.result);
      setRestoredFromSession(false);
      window.sessionStorage.setItem(CHECK_SESSION_KEY, JSON.stringify(snapshot));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function invalidateResult() {
    setResult(null);
    setCalculatedInput(null);
    setFormError(null);
    setRestoredFromSession(false);
    window.sessionStorage.removeItem(CHECK_SESSION_KEY);
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
    setMediaAdSpend(null);
    setAdditionalAdCost(null);
    setAttributedGmv(null);
    setOrders(null);
    setUnitsSold(null);
    setLiveOrders(null);
    setLiveUnitsSold(null);
    setClicks(null);
    setResult(null);
    setCalculatedInput(null);
    setFormError(null);
    setRestoredFromSession(false);
    window.sessionStorage.removeItem(CHECK_SESSION_KEY);
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

  function updateProgram(
    id: ShopeeProgramId,
    patch: Partial<ShopeeProgramDraft>,
  ) {
    setPrograms((current) => updateShopeeProgramDrafts(current, id, patch));
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

    return [...fees, ...buildShopeeProgramFees(programs)];
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
    if (!areShopeeProgramDraftsReady(programs)) {
      return "Lengkapi persentase program Shopee yang diaktifkan.";
    }

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

    if (liveProgramEnabled) {
      if (liveOrders === null || liveOrders < 0 || liveOrders > orders) {
        return "Orders dari Shopee Live harus diisi dan tidak boleh melebihi total Orders.";
      }

      if (
        liveUnitsSold === null ||
        liveUnitsSold < 0 ||
        liveUnitsSold > unitsSold
      ) {
        return "Units dari Shopee Live harus diisi dan tidak boleh melebihi total Units Sold.";
      }
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
      liveOrders !== null &&
      (liveOrders < 0 ||
        orders !== null &&
          liveOrders > orders)
    ) {
      return "Orders dari Shopee Live tidak valid.";
    }

    if (
      liveUnitsSold !== null &&
      (liveUnitsSold < 0 ||
        unitsSold !== null &&
          liveUnitsSold > unitsSold)
    ) {
      return "Units dari Shopee Live tidak valid.";
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

        ...(liveProgramEnabled &&
        liveOrders !== null &&
        liveUnitsSold !== null
          ? {
              liveOrders,
              liveUnitsSold,
            }
          : {}),

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
      setRestoredFromSession(false);
      window.sessionStorage.setItem(
        CHECK_SESSION_KEY,
        JSON.stringify({
          input,
          result: calculation,
        } satisfies CheckSessionSnapshot),
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
          programs={programs}
          onProgramChange={updateProgram}
          idPrefix="check-program"
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

            {liveProgramEnabled && (
              <>
                <NumberInput
                  id="check-live-orders"
                  label="Orders dari Shopee Live"
                  value={liveOrders}
                  onValueChange={(value) =>
                    updateField(setLiveOrders, value)
                  }
                  placeholder="3"
                  helperText="Pesanan yang teratribusi dari Shopee Live, termasuk Live Affiliate."
                  required
                />

                <NumberInput
                  id="check-live-units-sold"
                  label="Units dari Shopee Live"
                  value={liveUnitsSold}
                  onValueChange={(value) =>
                    updateField(setLiveUnitsSold, value)
                  }
                  placeholder="3"
                  helperText="Unit dari Live yang termasuk kategori eligible."
                  required
                />
              </>
            )}

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
          {restoredFromSession && (
            <div className="mb-4 rounded-xl border border-[var(--gp-info)] bg-[var(--gp-info-soft)] p-3">
              <p className="text-xs font-bold text-[var(--gp-info)]">
                Analisis terakhir dipulihkan
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
                Hasil tetap disimpan selama tab browser ini masih aktif. Klik
                &quot;Mulai ulang&quot; jika ingin menganalisis campaign lain.
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
              Analisis Iklan Saya
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
      <AnimatedResult>
        <section className="mx-auto mt-8 max-w-[1180px]">
          <CheckAdsResultPanel result={result} input={calculatedInput} />
          <div className="mt-5">
            <ShopeeValidationPanel
              key={`${result.estimatedProfitAfterAds}:${result.totalAdvertisingCost}:${calculatedInput.campaign.attributedGmv}:${calculatedInput.campaign.orders}:${calculatedInput.campaign.unitsSold}`}
              result={result}
              input={calculatedInput}
            />
          </div>
          <div className="mt-4 max-w-[360px]">
            <SaveCalculationButton
              kind="CHECK"
              planInput={calculatedInput.economics}
              checkInput={calculatedInput}
              checkResult={result}
            />
          </div>
          <div className="mt-4 max-w-[520px]">
            <ExportShareActions
              kind="CHECK"
              checkResult={result}
            />
          </div>
        </section>
      </AnimatedResult>
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
