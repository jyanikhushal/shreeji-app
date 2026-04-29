import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ANIMATIONS = ['dog', 'flag', 'namaste'];

export function useNavTransition() {
  const router = useRouter();
  const [transitioning, setTransitioning]   = useState(false);
  const [showError,     setShowError]       = useState(false);
  const [animType,      setAnimType]        = useState('dog');
  const timersRef = useRef([]);

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const navigateTo = useCallback((path) => {
    clearAll();

    // pick a random funky animation
    setAnimType(ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]);
    setTransitioning(true);
    setShowError(false);

    // ── wait minimum 2s, THEN actually navigate ──
    const t1 = setTimeout(() => {
      router.push(path);

      // if still on this page after 3 more seconds (5s total) → error
      const t2 = setTimeout(() => {
        setShowError(true);

        // show error 2s then go back
        const t3 = setTimeout(() => {
          setTransitioning(false);
          setShowError(false);
          router.back();
        }, 2000);
        timersRef.current.push(t3);
      }, 3000);
      timersRef.current.push(t2);

    }, 2000); // ← minimum 2s overlay
    timersRef.current.push(t1);

  }, [router]);

  return { navigateTo, transitioning, showError, animType };
}