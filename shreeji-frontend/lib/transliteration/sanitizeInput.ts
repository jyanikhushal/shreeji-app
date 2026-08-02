const STRAY_SYMBOLS = /[,.<>?:"/;'\[\]\\]/g;

export function sanitizeItemInput(text: string): string {
  if (!text) return text;
  return text.replace(STRAY_SYMBOLS, '').replace(/\s+/g, ' ').trim();
}