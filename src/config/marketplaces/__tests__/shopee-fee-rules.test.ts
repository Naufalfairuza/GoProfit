import { describe, expect, it } from "vitest";

import {
  resolveShopeeFeeRules,
  type ShopeeFeeRule,
} from "../shopee-fee-rules";

const baseRule: ShopeeFeeRule = {
  id: "admin-any",
  version: "2026-01",
  ruleKey: "MARKETPLACE_ADMIN",
  categoryId: "ANY",
  sellerStatus: "ANY",
  productSize: "ANY",
  effectiveFrom: "2026-01-01",
  name: "Biaya admin",
  feeType: "PERCENTAGE",
  rateBps: 800,
  calculationBase: "EFFECTIVE_SELLING_PRICE",
  sourceUrl: "https://seller.shopee.co.id/edu/article/3489",
  sourceNote: "Fixture pengujian, bukan tarif produksi.",
};

describe("resolveShopeeFeeRules", () => {
  it("chooses the most specific category/status/size rule", () => {
    const rules: ShopeeFeeRule[] = [
      baseRule,
      {
        ...baseRule,
        id: "admin-electronics",
        categoryId: "electronics",
        rateBps: 900,
      },
      {
        ...baseRule,
        id: "admin-electronics-star-special",
        categoryId: "electronics",
        sellerStatus: "STAR",
        productSize: "SPECIAL",
        rateBps: 1_000,
      },
    ];

    const [resolved] = resolveShopeeFeeRules(
      {
        categoryId: "electronics",
        sellerStatus: "STAR",
        productSize: "SPECIAL",
        effectiveDate: "2026-06-01",
      },
      rules,
    );

    expect(resolved.id).toBe("admin-electronics-star-special");
    expect(resolved.rateBps).toBe(1_000);
  });

  it("chooses the newest matching rule when specificity is equal", () => {
    const rules: ShopeeFeeRule[] = [
      baseRule,
      {
        ...baseRule,
        id: "admin-any-new",
        version: "2026-07",
        effectiveFrom: "2026-07-01",
        rateBps: 850,
      },
    ];

    const [resolved] = resolveShopeeFeeRules(
      {
        categoryId: "fashion",
        sellerStatus: "REGULAR",
        productSize: "REGULAR",
        effectiveDate: "2026-08-01",
      },
      rules,
    );

    expect(resolved.id).toBe("admin-any-new");
  });

  it("does not return a rule outside its effective date", () => {
    const [resolved] = resolveShopeeFeeRules(
      {
        categoryId: "fashion",
        sellerStatus: "REGULAR",
        productSize: "REGULAR",
        effectiveDate: "2025-12-31",
      },
      [baseRule],
    );

    expect(resolved).toBeUndefined();
  });
});
