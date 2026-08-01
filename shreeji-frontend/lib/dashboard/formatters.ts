import { Timestamp } from "firebase/firestore";
import i18n from "@/i18n/config";

export function formatdaysago(lastdepositat: Timestamp | null | undefined, currentnow: number): string {
  if (!lastdepositat) return i18n.t('dashboard:noDepositsYet');
  const date = lastdepositat.toDate();
  const diffms = currentnow - date.getTime();
  const days = Math.floor(diffms / (1000 * 60 * 60 * 24));
  if (days === 0) return i18n.t('dashboard:today');
  if (days === 1) return i18n.t('dashboard:oneDayAgo');
  return i18n.t('dashboard:daysAgo', { days });
}