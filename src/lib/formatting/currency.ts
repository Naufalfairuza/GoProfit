export function formatIDR(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export function parseIDRInput(rawValue: string): number | null {
  const digits = rawValue.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const value = Number(digits);

  if (!Number.isSafeInteger(value)) {
    return null;
  }

  return value;
}