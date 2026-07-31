export function formattoday(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Used only in loadkhata(): if date is already a string, use it as-is.
export function formatledgerdate(
  date: string | { _seconds: number },
  fallback: string = ""
): string {
  if (typeof date === "string") return date;
  if (date && date._seconds) {
    const jsdate = new Date(date._seconds * 1000);
    return `${String(jsdate.getDate()).padStart(2, '0')}/${String(jsdate.getMonth() + 1).padStart(2, '0')}/${jsdate.getFullYear()}`;
  }
  return fallback;
}

// Used only in the queue's confirm-callbacks: a string date is IGNORED here,
// only a Firestore-seconds object overrides the passed-in default. Do not
// merge this with formatledgerdate — the behavior genuinely differs.
export function formatconfirmeddate(
  date: string | { _seconds: number } | undefined,
  defaultvalue: string
): string {
  if (date && typeof date !== 'string' && date._seconds) {
    const jsdate = new Date(date._seconds * 1000);
    return `${String(jsdate.getDate()).padStart(2, '0')}/${String(jsdate.getMonth() + 1).padStart(2, '0')}/${jsdate.getFullYear()}`;
  }
  return defaultvalue;
}