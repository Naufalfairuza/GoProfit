import { describe, expect, it } from "vitest";
import { checkAds } from "../check-ads";
import { basePlanInput } from "./fixtures";
import { CALCULATION_RULE_VERSION } from "../constants";

function expectClose(actual: number | undefined, expected: number, precision = 2) {
  expect(actual).toBeDefined();
  expect(Number((actual as number).toFixed(precision))).toBe(Number(expected.toFixed(precision)));
}

describe("checkAds", () => {
  it("TC-101 calculates campaign profitability", () => {
    const economics = basePlanInput();
    economics.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 25_000 };

    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 100_000,
        additionalAdCost: 0,
        attributedGmv: 750_000,
        orders: 5,
        unitsSold: 5,
        clicks: 120,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.breakdown.contributionBeforeAds).toBe(273_750);
    expect(result.estimatedProfitAfterAds).toBe(173_750);
    expect(result.estimatedProfitPerOrder).toBe(34_750);
    expectClose(result.reportedRoas, 7.5, 4);
    expect(result.reportedAcosBps).toBe(1_333);
    expect(result.cpa).toBe(20_000);
    expect(result.cpc).toBe(833);
    expect(result.diagnosis).toBe("TARGET_MET");
  });

  it("TC-102 separates per-unit and per-order costs", () => {
    const economics = basePlanInput();
    economics.hppPerUnit = 50_000;
    economics.listPrice = 100_000;
    economics.fees = [
      {
        id: "process",
        name: "Process",
        feeType: "FIXED",
        fixedAmount: 1_250,
        calculationBase: "EFFECTIVE_SELLING_PRICE",
        scope: "PER_ORDER",
        source: "CUSTOM",
        active: true,
      },
    ];
    economics.costs = [
      {
        id: "bag",
        type: "PACKAGING",
        name: "Bag",
        amount: 1_000,
        scope: "PER_UNIT",
      },
    ];

    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 0,
        additionalAdCost: 0,
        attributedGmv: 200_000,
        orders: 1,
        unitsSold: 2,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.breakdown.hpp).toBe(100_000);
    expect(result.breakdown.fees.total).toBe(1_250);
    expect(result.breakdown.costs.total).toBe(2_000);
    expect(result.breakdown.contributionBeforeAds).toBe(96_750);
    expect(result.warnings.some((w) => w.code === "MULTI_UNIT_ORDER_ESTIMATE")).toBe(true);
  });

  it("TC-103/104 keeps CPA and CPC unavailable when denominators are unavailable", () => {
    const economics = basePlanInput();
    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 10_000,
        additionalAdCost: 0,
        attributedGmv: 0,
        orders: 0,
        unitsSold: 0,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.cpa).toBeUndefined();
    expect(result.cpc).toBeUndefined();
    expect(result.reportedAcosBps).toBeUndefined();
    expect(result.warnings.some((w) => w.code === "NO_ORDERS")).toBe(true);
  });

  it("TC-105 warns on explicit zero clicks", () => {
    const economics = basePlanInput();
    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 10_000,
        additionalAdCost: 0,
        attributedGmv: 100_000,
        orders: 1,
        unitsSold: 1,
        clicks: 0,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.cpc).toBeUndefined();
    expect(result.warnings.some((w) => w.code === "NO_CLICKS")).toBe(true);
  });

  it("TC-106 includes additional ad cost in economic ROAS and profit", () => {
    const economics = basePlanInput();
    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 100_000,
        additionalAdCost: 11_000,
        attributedGmv: 750_000,
        orders: 5,
        unitsSold: 5,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.totalAdvertisingCost).toBe(111_000);
    expect(result.estimatedProfitAfterAds).toBe(162_750);
    expectClose(result.reportedRoas, 7.5, 4);
    expectClose(result.economicRoas, 750_000 / 111_000, 6);
  });

  it("TC-107 emits GMV mismatch warning", () => {
    const economics = basePlanInput();
    const result = checkAds({
      economics,
      campaign: {
        mediaAdSpend: 50_000,
        additionalAdCost: 0,
        attributedGmv: 600_000,
        orders: 5,
        unitsSold: 5,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    });

    expect(result.warnings.some((w) => w.code === "GMV_UNIT_ECONOMICS_MISMATCH")).toBe(true);
  });
});
