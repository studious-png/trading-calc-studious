const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) {
    return "$0.00";
  }
  return usdFormatter.format(value);
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) {
    return "N/A";
  }
  return `${value.toFixed(2)} R`;
}
