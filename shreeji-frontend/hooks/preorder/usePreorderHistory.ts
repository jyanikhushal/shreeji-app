import { useState, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";
import { fetchGuestOrderHistory } from "@/app/utils/preorderApi";
import type { Preorder } from "@/types/preorder";

export function usePreorderHistory(malikPhone: string, guestPhone: string | null) {
  const { showMessage } = useToast();
  const [history, setHistory] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!guestPhone) return;
    setLoading(true);
    try {
      const data = await fetchGuestOrderHistory(malikPhone, guestPhone);
      setHistory(data);
      setLoaded(true);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [malikPhone, guestPhone, showMessage]);

  return { history, loading, loaded, loadHistory };
}