export function isvalidamount(amount: string): boolean {
  if (!amount) return false;
  const num = Number(amount);
  if (isNaN(num)) return false;
  if (num <= 0) return false;
  if (num > 100000) return false;
  return true;
}