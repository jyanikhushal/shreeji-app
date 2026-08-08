import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";
import { fetchPreorderReadyList, checkKhataMatch, savePreorderDestination } from "@/app/utils/preorderApi";
import type { Preorder } from "@/types/preorder";

export function usePreorderReadyQueue(malikPhone: string | null) {
  const { showMessage } = useToast();
  const [items, setItems] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPreorder, setSelectedPreorder] = useState<Preorder | null>(null);
  const [khataMatchName, setKhataMatchName] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadReady = useCallback(async () => {
    if (!malikPhone) return;
    try {
      const data = await fetchPreorderReadyList(malikPhone);
      setItems(data);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load ready orders");
    } finally {
      setLoading(false);
    }
  }, [malikPhone, showMessage]);

  useEffect(() => {
    loadReady();
    const interval = setInterval(loadReady, 15000);
    return () => clearInterval(interval);
  }, [loadReady]);

  const openDetail = async (preorder: Preorder) => {
    setSelectedPreorder(preorder);
    setDetailOpen(true);
    setKhataMatchName(null);
    if (malikPhone) {
      try {
        const match = await checkKhataMatch(malikPhone, preorder.guestPhone);
        setKhataMatchName(match?.khataRegisteredName ?? null);
      } catch {
        // hint just won't show
      }
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedPreorder(null);
    setKhataMatchName(null);
  };

  const saveDestination = async (savedAs: "normal" | "khata", customerTypedName: string) => {
    if (!malikPhone || !selectedPreorder) return;
    setActionLoading(true);
    try {
      const savedNames = savedAs === "khata"
        ? { typedByCustomer: customerTypedName, khataRegisteredName: khataMatchName || customerTypedName }
        : undefined;
      await savePreorderDestination(malikPhone, selectedPreorder.id, savedAs, savedNames);
      await loadReady();
      closeDetail();
      showMessage("success", "Order collected and saved");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setActionLoading(false);
    }
  };

  // no-ops — this queue only ever shows status "ready", so these actions are unreachable
  const noop = async () => {};

  return {
    items, loading, detailOpen, selectedPreorder, khataMatchName, actionLoading,
    openDetail, closeDetail, saveDestination, startPreparing: noop, markReady: noop,
  };
}