export function isValidPhone(p: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(p.trim());
}