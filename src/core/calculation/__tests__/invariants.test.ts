import { describe, expect, it } from "vitest";
import { checkAds } from "../check-ads";
import { planAds } from "../plan-ads";
import { basePlanInput } from "./fixtures";
import { CALCULATION_RULE_VERSION } from "../constants";

describe("financial invariants", () => {
  it("higher HPP cannot improve BEP ROAS", () => {
    const low = basePlanInput();
    const high = basePlanInput();
    high.hppPerUnit += 10_000;

    const a = planAds(low);
    const b = planAds(high);

    expect(a.status).toBe("BREAK_EVEN_ONLY");
    expect(b.status).toBe("BREAK_EVEN_ONLY");
    if (a.status !== "BREAK_EVEN_ONLY" || b.status !== "BREAK_EVEN_ONLY") return;

    expect(b.breakEvenRoas).toBeGreaterThan(a.breakEvenRoas);
  });

  it("higher target profit cannot lower minimum target ROAS", () => {
    const low = basePlanInput();
    low.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 10_000 };
    const high = basePlanInput();
    high.targetProfit = { mode: "AMOUNT_PER_ORDER", amount: 30_000 };

    const a = planAds(low);
    const b = planAds(high);

    expect(a.status).toBe("TARGET_FEASIBLE");
    expect(b.status).toBe("TARGET_FEASIBLE");
    if (a.status !== "TARGET_FEASIBLE" || b.status !== "TARGET_FEASIBLE") return;

    expect(b.minimumTargetRoas).toBeGreaterThan(a.minimumTargetRoas);
  });

  it("higher seller discount cannot increase effective revenue", () => {
    const a = basePlanInput();
    a.adjustments = [
      { id: "d", type: "PRODUCT_DISCOUNT", amount: 5_000, scope: "PER_UNIT" },
    ];
    const b = basePlanInput();
    b.adjustments = [
      { id: "d", type: "PRODUCT_DISCOUNT", amount: 10_000, scope: "PER_UNIT" },
    ];

    const ra = planAds(a);
    const rb = planAds(b);
    expect(rb.breakdown.pricing.effectiveRevenue).toBeLessThan(ra.breakdown.pricing.effectiveRevenue);
  });

  it("higher additional ad cost cannot improve profit after ads", () => {
    const economics = basePlanInput();
    const common = {
      economics,
      campaign: {
        mediaAdSpend: 100_000,
        additionalAdCost: 0,
        attributedGmv: 750_000,
        orders: 5,
        unitsSold: 5,
      },
      calculationRuleVersion: CALCULATION_RULE_VERSION,
    };

    const a = checkAds(common);
    const b = checkAds({
      ...common,
      campaign: { ...common.campaign, additionalAdCost: 20_000 },
    });

    expect(b.estimatedProfitAfterAds).toBeLessThan(a.estimatedProfitAfterAds);
  });
});
