import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { submitPreorder } from "@/app/utils/preorderApi";
import type { PreorderRowState } from "./usePreorderItemRows";

export function usePreorderSubmit(malikPhone: string | null, guestPhone: string | null) {
  const { showMessage } = useToast();
  const [sending, setSending] = useState(false);
  const [submittedPreorderId, setSubmittedPreorderId] = useState<string | null>(null);

  const send = async (rows: PreorderRowState[]) => {
    if (!malikPhone || !guestPhone || rows.length === 0) return;
    setSending(true);
    try {
      const items = rows.map(r => ({ item: r.item, quantity: r.quantity }));
      const preorder = await submitPreorder(malikPhone, guestPhone, items);
      setSubmittedPreorderId(preorder.id);
      showMessage("success", "Order sent! You'll be notified when it's ready.");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to send order");
    } finally {
      setSending(false);
    }
  };

  return { sending, submittedPreorderId, send };
}