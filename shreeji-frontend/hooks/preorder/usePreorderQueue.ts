import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";
import { fetchPreorderQueue, updatePreorderStatus, checkKhataMatch, savePreorderDestination } from "@/app/utils/preorderApi";
import type { Preorder } from "@/types/preorder";

export function usePreorderQueue(malikPhone: string | null) {
  const { showMessage } = useToast();
  const [items, setItems] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPreorder, setSelectedPreorder] = useState<Preorder | null>(null);
  const [khataMatchName, setKhataMatchName] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    if (!malikPhone) return;
    try {
      const data = await fetchPreorderQueue(malikPhone);
      setItems(data);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [malikPhone, showMessage]);

  useEffect(() => {
    loadQueue();
    // Poll every 15s — simple approach for now, matches "quick-commerce responsiveness"
    // without needing a Firestore realtime listener wired up yet.
    const interval = setInterval(loadQueue, 15000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const openDetail = async (preorder: Preorder) => {
    setSelectedPreorder(preorder);
    setDetailOpen(true);
    setKhataMatchName(null);
    if (malikPhone) {
      try {
        const match = await checkKhataMatch(malikPhone, preorder.guestPhone);
        setKhataMatchName(match?.khataRegisteredName ?? null);
      } catch {
        // Non-critical — hint just won't show
      }
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedPreorder(null);
    setKhataMatchName(null);
  };

  const startPreparing = async () => {
    if (!malikPhone || !selectedPreorder) return;
    setActionLoading(true);
    try {
      await updatePreorderStatus(malikPhone, selectedPreorder.id, "in_progress");
      await loadQueue();
      setSelectedPreorder(prev => prev ? { ...prev, status: "in_progress" } : prev);
      showMessage("success", "Marked as preparing");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  const markReady = async () => {
  if (!malikPhone || !selectedPreorder) return;
  setActionLoading(true);
  try {
    await updatePreorderStatus(malikPhone, selectedPreorder.id, "ready");
    await loadQueue();
    closeDetail();
    showMessage("success", "Customer notified — order ready");
  } catch (err) {
    showMessage("error", err instanceof Error ? err.message : "Failed to update");
  } finally {
    setActionLoading(false);
  }
};

  const saveDestination = async (savedAs: "normal" | "khata", customerTypedName: string) => {
    if (!malikPhone || !selectedPreorder) return;
    setActionLoading(true);
    try {
      const savedNames = savedAs === "khata"
        ? { typedByCustomer: customerTypedName, khataRegisteredName: khataMatchName || customerTypedName }
        : undefined;
      await savePreorderDestination(malikPhone, selectedPreorder.id, savedAs, savedNames);
      await loadQueue();
      closeDetail();
      showMessage("success", "Order saved");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    items, loading, detailOpen, selectedPreorder, khataMatchName, actionLoading,
    openDetail, closeDetail, startPreparing, markReady, saveDestination,
  };
}