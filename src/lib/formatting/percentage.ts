export function formatPercentageFromBps(valueBps: number): string {
  const percentage = valueBps / 100;

  return Number.isInteger(percentage)
    ? String(percentage)
    : String(percentage).replace(".", ",");
}

export function parsePercentageToBps(rawValue: string): number | null {
  const normalized = rawValue
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  if (!normalized) {
    return null;
  }

  const percentage = Number(normalized);

  if (!Number.isFinite(percentage) || percentage < 0) {
    return null;
  }

  const bps = Math.round(percentage * 100);

  if (!Number.isSafeInteger(bps)) {
    return null;
  }

  return bps;
}