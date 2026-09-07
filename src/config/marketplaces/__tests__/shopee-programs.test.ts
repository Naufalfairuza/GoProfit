import { describe, expect, it } from "vitest";

import {
  buildShopeeProgramFees,
  createShopeeProgramDrafts,
  updateShopeeProgramDrafts,
} from "../shopee-programs";

describe("Shopee program presets", () => {
  it("switches Live XTRA from 3% to 2% when Promo XTRA is active", () => {
    let programs = createShopeeProgramDrafts();

    programs = updateShopeeProgramDrafts(programs, "shopee-live-xtra", {
      enabled: true,
    });
    expect(programs.find((program) => program.id === "shopee-live-xtra")?.rateBps).toBe(300);

    programs = updateShopeeProgramDrafts(programs, "promo-xtra", {
      enabled: true,
    });
    expect(programs.find((program) => program.id === "shopee-live-xtra")?.rateBps).toBe(200);

    const liveFee = buildShopeeProgramFees(programs).find(
      (fee) => fee.id === "shopee-program-shopee-live-xtra",
    );
    expect(liveFee?.rateBps).toBe(200);
    expect(liveFee?.capAmountPerUnit).toBe(20_000);
    expect(liveFee?.attribution).toBe("SHOPEE_LIVE");
  });
});
