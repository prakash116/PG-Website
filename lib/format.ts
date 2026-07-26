export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatBudgetRange(min: number, max: number | null): string {
  if (max === null) return `${formatINR(min)}+`;
  if (min === 0) return `Under ${formatINR(max)}`;
  return `${formatINR(min)} – ${formatINR(max)}`;
}
