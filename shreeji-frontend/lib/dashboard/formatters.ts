import { Timestamp } from "firebase/firestore";

export function formatdaysago(lastdepositat: Timestamp | null | undefined, currentnow: number): string {
  if (!lastdepositat) return "no deposits yet";
  const date = lastdepositat.toDate();
  const diffms = currentnow - date.getTime();
  const days = Math.floor(diffms / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}