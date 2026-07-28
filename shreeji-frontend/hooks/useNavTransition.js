import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STAMP_DURATION = 1300; // ms — time the stamp animation plays before navigating

export function useNavTransition() {
  const router = useRouter();
  const [stamping, setStamping] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const navigateTo = useCallback((path) => {
    setStamping(true);

    // Let the stamp animation actually play before navigating away
    const t1 = setTimeout(() => {
      router.push(path);
      // Give the new page a beat to mount before clearing the overlay
      const t2 = setTimeout(() => setStamping(false), 250);
      timersRef.current.push(t2);
    }, STAMP_DURATION);

    timersRef.current.push(t1);
  }, [router]);

  return { navigateTo, stamping };
}