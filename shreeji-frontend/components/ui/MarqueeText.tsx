'use client';
import { useEffect, useRef, useState } from 'react';

let uidCounter = 0;

export default function MarqueeText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [dims, setDims] = useState<{ c: number; t: number } | null>(null);
  const [animName] = useState(() => `khata-ticker-${uidCounter++}`);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (containerRef.current && textRef.current) {
        setDims({
          c: containerRef.current.offsetWidth,
          t: textRef.current.offsetWidth,
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [text]);

  if (!text) return null;

  // Constant speed regardless of cell width or text length — longer trips just take longer
  const totalDistance = dims ? dims.c + dims.t : 0;
  const duration = Math.max(3, totalDistance / 35);

  return (
    <div
      ref={containerRef}
      style={{ overflow: 'hidden', width: '100%', whiteSpace: 'nowrap', position: 'relative', height: '1.4em' }}
    >
      {dims && (
        <style>{`
          @keyframes ${animName} {
            from { transform: translateX(${dims.c}px); }
            to { transform: translateX(-${dims.t}px); }
          }
        `}</style>
      )}
      <span
        ref={textRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          animation: dims ? `${animName} ${duration}s linear infinite` : 'none',
          willChange: 'transform',
        }}
      >
        {text}
      </span>
    </div>
  );
}