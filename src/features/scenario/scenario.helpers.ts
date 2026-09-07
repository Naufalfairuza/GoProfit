import type {
    PlanAdsInput,
    ScenarioCost,
    ScenarioFee,
    SellerAdjustment,
} from "@/domain/types";

import type {
    ScenarioDraft,
    ScenarioTargetProfitMode,
} from "./types";

const ADMIN_FEE_ID =
  "marketplace-admin-fee";

const PROCESS_FEE_ID =
  "marketplace-process-fee";

const PACKING_COST_ID =
  "packing-cost";

export function createScenarioDraft(
  baseInput: PlanAdsInput,
  scenarioNumber: number,
): ScenarioDraft {
  const adminFee = baseInput.fees.find(
    (fee) =>
      fee.id === ADMIN_FEE_ID &&
      fee.feeType === "PERCENTAGE",
  );

  const processFee = baseInput.fees.find(
    (fee) =>
      fee.id === PROCESS_FEE_ID &&
      fee.feeType === "FIXED",
  );

  const packingCost =
    baseInput.costs.find(
      (cost) =>
        cost.id === PACKING_COST_ID,
    );

  const productDiscount =
    baseInput.adjustments.find(
      (adjustment) =>
        adjustment.type ===
        "PRODUCT_DISCOUNT",
    );

  const sellerVoucher =
    baseInput.adjustments.find(
      (adjustment) =>
        adjustment.type ===
        "SELLER_VOUCHER",
    );

  const target =
    extractTargetProfit(
      baseInput,
    );

  return {
    id: `scenario-${scenarioNumber}`,

    name: getScenarioName(
      scenarioNumber,
    ),

    listPrice:
      baseInput.listPrice,

    hppPerUnit:
      baseInput.hppPerUnit,

    adminFeeBps:
      adminFee?.rateBps ?? null,

    processFee:
      processFee?.fixedAmount ??
      null,

    packingCost:
      packingCost?.amount ?? null,

    showDiscount:
      Boolean(productDiscount),

    discount:
      productDiscount?.amount ??
      null,

    showVoucher:
      Boolean(sellerVoucher),

    voucher:
      sellerVoucher?.amount ??
      null,

    targetMode:
      target.mode,

    targetAmount:
      target.amount,

    targetRateBps:
      target.rateBps,
  };
}

export function buildScenarioInput(
  baseInput: PlanAdsInput,
  draft: ScenarioDraft,
): PlanAdsInput | null {
  if (
    draft.listPrice === null ||
    draft.hppPerUnit === null
  ) {
    return null;
  }

  const targetProfit =
    buildScenarioTargetProfit(
      draft,
    );

  if (!targetProfit) {
    return null;
  }

  return {
    ...clonePlanInput(baseInput),

    listPrice:
      draft.listPrice,

    hppPerUnit:
      draft.hppPerUnit,

    adjustments:
      buildScenarioAdjustments(
        baseInput.adjustments,
        draft,
      ),

    fees:
      buildScenarioFees(
        baseInput.fees,
        draft,
      ),

    costs:
      buildScenarioCosts(
        baseInput.costs,
        draft,
      ),

    targetProfit,
  };
}

export function clonePlanInput(
  input: PlanAdsInput,
): PlanAdsInput {
  return {
    ...input,

    adjustments:
      input.adjustments.map(
        (adjustment) => ({
          ...adjustment,
        }),
      ),

    fees:
      input.fees.map(
        (fee) => ({
          ...fee,
        }),
      ),

    costs:
      input.costs.map(
        (cost) => ({
          ...cost,
        }),
      ),

    targetProfit: {
      ...input.targetProfit,
    },
  };
}

function buildScenarioAdjustments(
  originalAdjustments:
    SellerAdjustment[],
  draft: ScenarioDraft,
): SellerAdjustment[] {
  const adjustments =
    originalAdjustments
      .filter(
        (adjustment) =>
          adjustment.type !==
            "PRODUCT_DISCOUNT" &&
          adjustment.type !==
            "SELLER_VOUCHER",
      )
      .map((adjustment) => ({
        ...adjustment,
      }));

  if (
    draft.showDiscount &&
    draft.discount !== null
  ) {
    adjustments.push({
      id:
        "product-discount",

      type:
        "PRODUCT_DISCOUNT",

      amount:
        draft.discount,

      scope:
        "PER_UNIT",
    });
  }

  if (
    draft.showVoucher &&
    draft.voucher !== null
  ) {
    adjustments.push({
      id:
        "seller-voucher",

      type:
        "SELLER_VOUCHER",

      amount:
        draft.voucher,

      scope:
        "PER_ORDER",
    });
  }

  return adjustments;
}

function buildScenarioFees(
  originalFees: ScenarioFee[],
  draft: ScenarioDraft,
): ScenarioFee[] {
  let fees =
    originalFees
      .filter(
        (fee) =>
          fee.id !==
            ADMIN_FEE_ID &&
          fee.id !==
            PROCESS_FEE_ID,
      )
      .map((fee) => ({
        ...fee,
      }));

  if (
    draft.adminFeeBps !== null
  ) {
    fees = [
      ...fees,

      {
        id:
          ADMIN_FEE_ID,

        name:
          "Biaya Admin Marketplace",

        feeType:
          "PERCENTAGE",

        rateBps:
          draft.adminFeeBps,

        calculationBase:
          "EFFECTIVE_SELLING_PRICE",

        scope:
          "PER_ORDER",

        source:
          "CUSTOM",

        active:
          true,
      },
    ];
  }

  if (
    draft.processFee !== null
  ) {
    fees = [
      ...fees,

      {
        id:
          PROCESS_FEE_ID,

        name:
          "Biaya Proses Pesanan",

        feeType:
          "FIXED",

        fixedAmount:
          draft.processFee,

        calculationBase:
          "EFFECTIVE_SELLING_PRICE",

        scope:
          "PER_ORDER",

        source:
          "CUSTOM",

        active:
          true,
      },
    ];
  }

  return fees;
}

function buildScenarioCosts(
  originalCosts: ScenarioCost[],
  draft: ScenarioDraft,
): ScenarioCost[] {
  const costs =
    originalCosts
      .filter(
        (cost) =>
          cost.id !==
          PACKING_COST_ID,
      )
      .map((cost) => ({
        ...cost,
      }));

  if (
    draft.packingCost === null
  ) {
    return costs;
  }

  return [
    ...costs,

    {
      id:
        PACKING_COST_ID,

      type:
        "PACKAGING",

      name:
        "Biaya Packing",

      amount:
        draft.packingCost,

      scope:
        "PER_ORDER",
    },
  ];
}

function buildScenarioTargetProfit(
  draft: ScenarioDraft,
): PlanAdsInput["targetProfit"] | null {
  if (
    draft.targetMode === "NONE"
  ) {
    return {
      mode:
        "NONE",
    };
  }

  if (
    draft.targetMode ===
    "AMOUNT_PER_ORDER"
  ) {
    if (
      draft.targetAmount === null
    ) {
      return null;
    }

    return {
      mode:
        "AMOUNT_PER_ORDER",

      amount:
        draft.targetAmount,
    };
  }

  if (
    draft.targetRateBps === null
  ) {
    return null;
  }

  if (
    draft.targetMode ===
    "NET_MARGIN_PERCENT"
  ) {
    return {
      mode:
        "NET_MARGIN_PERCENT",

      rateBps:
        draft.targetRateBps,
    };
  }

  return {
    mode:
      "HPP_MARKUP_PERCENT",

    rateBps:
      draft.targetRateBps,
  };
}

function extractTargetProfit(
  input: PlanAdsInput,
): {
  mode: ScenarioTargetProfitMode;
  amount: number | null;
  rateBps: number | null;
} {
  const target =
    input.targetProfit;

  if (
    target.mode === "NONE"
  ) {
    return {
      mode:
        "NONE",

      amount:
        null,

      rateBps:
        null,
    };
  }

  if (
    target.mode ===
    "AMOUNT_PER_ORDER"
  ) {
    return {
      mode:
        "AMOUNT_PER_ORDER",

      amount:
        target.amount,

      rateBps:
        null,
    };
  }

  return {
    mode:
      target.mode,

    amount:
      null,

    rateBps:
      target.rateBps,
  };
}

function getScenarioName(
  scenarioNumber: number,
): string {
  const names = [
    "Scenario A",
    "Scenario B",
    "Scenario C",
  ];

  return (
    names[
      scenarioNumber - 1
    ] ??
    `Scenario ${scenarioNumber}`
  );
}