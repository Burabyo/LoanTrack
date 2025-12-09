// lib/format.ts
export function formatCurrency(amount: number): string {
  return `UGX ${amount.toLocaleString()}`;
}
