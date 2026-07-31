export function isvalidphone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}