import { useEffect, useState } from "react";

export function useNowTicker(intervalms: number = 60 * 1000) {
  const [now, setnow] = useState<number | null>(null);

  useEffect(() => {
    const updatenow = () => setnow(Date.now());
    const timeout = setTimeout(updatenow, 0);
    const interval = setInterval(updatenow, intervalms);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalms]);

  return now;
}