import { BPS_DENOMINATOR } from "./constants";
import type { BasisPoints, Money } from "../../domain/types";

export function assertSafeMoney(value: number, label: string): asserts value is Money {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} must be a safe integer amount in rupiah.`);
  }
}

export function roundMoney(value: number): Money {
  if (!Number.isFinite(value)) {
    throw new Error("Cannot round a non-finite monetary value.");
  }
  return Math.round(value);
}

export function applyBasisPoints(base: Money, rateBps: BasisPoints): Money {
  return roundMoney((base * rateBps) / BPS_DENOMINATOR);
}

export function ratioToBasisPoints(numerator: number, denominator: number): BasisPoints {
  if (denominator <= 0) {
    throw new Error("Denominator must be greater than zero.");
  }
  return Math.round((numerator / denominator) * BPS_DENOMINATOR);
}

export function safeDivide(numerator: number, denominator: number): number | undefined {
  if (denominator <= 0) return undefined;
  return numerator / denominator;
}

export function scopeMultiplier(
  scope: "PER_UNIT" | "PER_ORDER" | "PER_CAMPAIGN",
  quantities: { units: number; orders: number },
): number {
  switch (scope) {
    case "PER_UNIT":
      return quantities.units;
    case "PER_ORDER":
      return quantities.orders;
    case "PER_CAMPAIGN":
      return 1;
  }
}
