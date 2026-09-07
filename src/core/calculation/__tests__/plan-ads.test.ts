import { describe, expect, it } from "vitest";
import { planAds } from "../plan-ads";
import { basePlanInput } from "./fixtures";

function expectClose(actual: number, expected: number, precision = 2) {
  expect(Number(actual.toFixed(precision))).toBe(Number(expected.toFixed(precision)));
}

describe("planAds", () => {
  it("TC-001/002 calculates contribution, BEP ACOS and BEP ROAS", () => {
    const result = planAds(basePlanInput());
    expect(result.status).toBe("BREAK_EVEN_ONLY");
    if (result.status !== "BREAK_EVEN_ONLY") return;

    expect(result.breakdown.contributionBeforeAds).toBe(54_750);
    expect(result.breakEvenAcosBps).toBe(3_650);
    expectClose(result.breakEvenRoas, 2.7397260274, 6);
  });

  it("TC-003 calculates target amount per order", () => {
    const input = basePlanInput();
    input.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 25_000 };
    const result = planAds(input);

    expect(result.status).toBe("TARGET_FEASIBLE");
    if (result.status !== "TARGET_FEASIBLE") return;

    expect(result.targetProfit).toBe(25_000);
    expect(result.maxAdsCostForTarget).toBe(29_750);
    expectClose(result.minimumTargetRoas, 5.0420168067, 6);
  });

  it("TC-004 calculates 20% net margin target", () => {
    const input = basePlanInput();
    input.targetProfit = { mode: "NET_MARGIN_PERCENT", rateBps: 2_000 };
    const result = planAds(input);

    expect(result.status).toBe("TARGET_FEASIBLE");
    if (result.status !== "TARGET_FEASIBLE") return;

    expect(result.targetProfit).toBe(30_000);
    expect(result.maxAdsCostForTarget).toBe(24_750);
    expectClose(result.minimumTargetRoas, 6.0606060606, 6);
  });

  it("TC-005 calculates 30% HPP markup target", () => {
    const input = basePlanInput();
    input.targetProfit = { mode: "HPP_MARKUP_PERCENT", rateBps: 3_000 };
    const result = planAds(input);

    expect(result.status).toBe("TARGET_FEASIBLE");
    if (result.status !== "TARGET_FEASIBLE") return;

    expect(result.targetProfit).toBe(24_000);
    expect(result.maxAdsCostForTarget).toBe(30_750);
    expectClose(result.minimumTargetRoas, 4.8780487805, 6);
  });

  it("TC-006 respects fee calculation base", () => {
    const input = basePlanInput();
    input.listPrice = 200_000;
    input.hppPerUnit = 100_000;
    input.adjustments = [
      {
        id: "discount",
        type: "PRODUCT_DISCOUNT",
        amount: 20_000,
        scope: "PER_UNIT",
      },
      {
        id: "voucher",
        type: "SELLER_VOUCHER",
        amount: 10_000,
        scope: "PER_ORDER",
      },
    ];
    input.fees = [
      {
        id: "admin",
        name: "Admin",
        feeType: "PERCENTAGE",
        rateBps: 1_000,
        calculationBase: "AFTER_PRODUCT_DISCOUNT",
        scope: "PER_ORDER",
        source: "CUSTOM",
        active: true,
      },
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
    input.costs = [];

    const result = planAds(input);
    expect(result.breakdown.pricing.effectiveRevenue).toBe(170_000);
    expect(result.breakdown.fees.items[0]?.amount).toBe(18_000);
    expect(result.breakdown.contributionBeforeAds).toBe(50_750);
  });

  it("TC-007 returns NOT_ADS_FEASIBLE for zero contribution", () => {
    const input = basePlanInput();
    input.listPrice = 100_000;
    input.hppPerUnit = 85_000;
    input.fees = [
      {
        id: "fee",
        name: "Fee",
        feeType: "FIXED",
        fixedAmount: 12_000,
        calculationBase: "EFFECTIVE_SELLING_PRICE",
        scope: "PER_ORDER",
        source: "CUSTOM",
        active: true,
      },
    ];
    input.costs = [
      {
        id: "packing",
        type: "PACKAGING",
        name: "Packing",
        amount: 3_000,
        scope: "PER_ORDER",
      },
    ];

    const result = planAds(input);
    expect(result.status).toBe("NOT_ADS_FEASIBLE");
    expect(result.breakdown.contributionBeforeAds).toBe(0);
  });

  it("TC-009 returns TARGET_NOT_FEASIBLE when target exceeds contribution", () => {
    const input = basePlanInput();
    input.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 60_000 };
    const result = planAds(input);

    expect(result.status).toBe("TARGET_NOT_FEASIBLE");
    if (result.status === "TARGET_NOT_FEASIBLE") {
      expect(result.reason).toBe("TARGET_EXCEEDS_CONTRIBUTION");
    }
  });

  it("returns no ads room when target equals contribution", () => {
    const input = basePlanInput();
    input.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 54_750 };
    const result = planAds(input);

    expect(result.status).toBe("TARGET_NOT_FEASIBLE");
    if (result.status === "TARGET_NOT_FEASIBLE") {
      expect(result.reason).toBe("NO_ADS_ROOM_FOR_TARGET");
    }
  });
});
