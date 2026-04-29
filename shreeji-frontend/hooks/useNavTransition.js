import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Updated animations for your product theme
const ANIMATIONS = ['ledger', 'digital', 'sync'];

export function useNavTransition() {
  const router = useRouter();

  const [transitioning, setTransitioning] = useState(false);
  const [showError, setShowError] = useState(false);
  const [animType, setAnimType] = useState('ledger');

  const timersRef = useRef([]);

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // cleanup on unmount (important for Next.js navigation)
  useEffect(() => {
    return () => clearAll();
  }, []);

  const navigateTo = useCallback((path) => {
    clearAll();

    // random but still meaningful (even if not used visually)
    setAnimType(ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]);
    setTransitioning(true);
    setShowError(false);

    const t1 = setTimeout(() => {
      router.push(path);

      const t2 = setTimeout(() => {
        setShowError(true);

        const t3 = setTimeout(() => {
          setTransitioning(false);
          setShowError(false);
          router.back();
        }, 2000);

        timersRef.current.push(t3);
      }, 3000);

      timersRef.current.push(t2);
    }, 2000);

    timersRef.current.push(t1);

  }, [router]);

  return { navigateTo, transitioning, showError, animType };
}