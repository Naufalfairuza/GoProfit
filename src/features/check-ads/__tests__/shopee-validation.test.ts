import { describe, expect, it } from "vitest";

import { calculateShopeeValidation } from "../shopee-validation";

describe("calculateShopeeValidation", () => {
  it("compares actual profit with the Check My Ads estimate", () => {
    const comparison = calculateShopeeValidation(
      {
        actualGmv: 1_000_000,
        actualHpp: 500_000,
        actualMarketplaceFees: 100_000,
        actualOperationalCosts: 25_000,
        actualAdvertisingCost: 150_000,
        actualRefunds: 10_000,
      },
      200_000,
    );

    expect(comparison.actualProfit).toBe(215_000);
    expect(comparison.estimatedProfit).toBe(200_000);
    expect(comparison.difference).toBe(15_000);
    expect(comparison.actualMarginBps).toBe(2_150);
  });

  it("does not calculate a margin when GMV is zero", () => {
    const comparison = calculateShopeeValidation(
      {
        actualGmv: 0,
        actualHpp: 0,
        actualMarketplaceFees: 0,
        actualOperationalCosts: 0,
        actualAdvertisingCost: 10_000,
        actualRefunds: 0,
      },
      -10_000,
    );

    expect(comparison.actualProfit).toBe(-10_000);
    expect(comparison.actualMarginBps).toBeUndefined();
  });
});
