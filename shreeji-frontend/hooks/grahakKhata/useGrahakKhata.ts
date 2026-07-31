import { useNavTransition } from "@/hooks/useNavTransition";
import { useGrahakParams } from "./useGrahakParams";
import { useGrahakAuth } from "./useGrahakAuth";
import { useKhataEntries } from "./useKhataEntries";
import { useNotificationPermission } from "./useNotificationPermission";
import { useNotificationHistory } from "./useNotificationHistory";

export function useGrahakKhata() {
  const { navigateTo, stamping } = useNavTransition();
  const { phone, malikPhone } = useGrahakParams();
  const authChecked = useGrahakAuth();
const { loading, entries, lastRowRef, setLastRowRef } = useKhataEntries(phone, malikPhone, authChecked);  const notifPermission = useNotificationPermission(phone, malikPhone, authChecked);
  const notifHistory = useNotificationHistory(phone, malikPhone, notifPermission.localGranted);

  const lastTotal = entries.length > 0 ? entries[entries.length - 1].total : 0;

  return {
    navigateTo, stamping,
    phone, malikPhone,
    loading, entries, lastRowRef, setLastRowRef, lastTotal,
    ...notifPermission,
    ...notifHistory,
  };
}