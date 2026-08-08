import { useEffect, useRef, useState, useCallback } from "react";
import { fetchGuestActiveStatus } from "@/app/utils/preorderApi";
import type { Preorder } from "@/types/preorder";

export function usePreorderLiveStatus(malikPhone: string, guestPhone: string | null) {
  const [order, setOrder] = useState<Preorder | null>(null);
  const [isCollectedTransient, setIsCollectedTransient] = useState(false);
  const hadOrderRef = useRef(false);
  const collectedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!guestPhone) return;
    try {
      const active = await fetchGuestActiveStatus(malikPhone, guestPhone);
      if (active) {
        hadOrderRef.current = true;
        setOrder(active);
        setIsCollectedTransient(false);
        if (collectedTimeoutRef.current) {
          clearTimeout(collectedTimeoutRef.current);
          collectedTimeoutRef.current = null;
        }
      } else if (hadOrderRef.current) {
        hadOrderRef.current = false;
        setIsCollectedTransient(true);
        collectedTimeoutRef.current = setTimeout(() => {
          setOrder(null);
          setIsCollectedTransient(false);
        }, 4000);
      }
    } catch {
      // silent — bar just skips this tick
    }
  }, [malikPhone, guestPhone]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => {
      clearInterval(interval);
      if (collectedTimeoutRef.current) clearTimeout(collectedTimeoutRef.current);
    };
  }, [refresh]);

  return { order, isCollectedTransient, refresh };
}