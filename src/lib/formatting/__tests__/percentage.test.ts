import { describe, expect, it } from "vitest";

import {
  formatPercentageFromBps,
  parsePercentageToBps,
} from "../percentage";

describe("percentage formatting", () => {
  it("accepts Indonesian decimal commas", () => {
    expect(parsePercentageToBps("8,5")).toBe(850);
    expect(parsePercentageToBps("8.5")).toBe(850);
  });

  it("keeps an unfinished decimal valid while typing", () => {
    expect(parsePercentageToBps("8,")).toBe(800);
  });

  it("formats stored basis points back to an Indonesian percentage", () => {
    expect(formatPercentageFromBps(850)).toBe("8,5");
  });
});
