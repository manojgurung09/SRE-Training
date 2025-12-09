export function formatINR(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatINRWithoutDecimals(amount: number): string {
  return `₹${Math.round(amount)}`;
}
