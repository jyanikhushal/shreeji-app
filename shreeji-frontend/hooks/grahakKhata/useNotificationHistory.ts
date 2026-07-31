import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { fetchNotificationHistory } from "@/app/utils/pushNotifications";
import { NotificationItem } from "@/types/grahakKhata";

export function useNotificationHistory(phone: string | null, malikPhone: string | null, localGranted: boolean) {
  const { showMessage } = useToast();
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openHistoryPanel = async () => {
    if (!localGranted || !phone || !malikPhone) return;
    setShowHistoryPanel(true);
    setHistoryLoading(true);
    try {
      const res = await fetchNotificationHistory(malikPhone, phone);
      setHistory(res.history || []);
    } catch {
      showMessage("error", "Failed to load notifications");
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryPanel = () => setShowHistoryPanel(false);

  return { showHistoryPanel, history, historyLoading, openHistoryPanel, closeHistoryPanel };
}