import { useEffect, useState, useCallback } from "react";
import { fetchPreorderReadyList } from "@/app/utils/preorderApi";

export function usePreorderReadyCount(malikPhone: string | null) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!malikPhone) return;
    try {
      const data = await fetchPreorderReadyList(malikPhone);
      setCount(data.length);
    } catch {
      // silent
    }
  }, [malikPhone]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return count;
}