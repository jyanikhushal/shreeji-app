'use client';
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";

type motiftype = {
  label: string;
  style: React.CSSProperties;
  depth: number;
  svg: React.ReactNode;
};

function FloatingMotif({
  motif, mousex, mousey,
}: { motif: motiftype; mousex: MotionValue<number>; mousey: MotionValue<number> }) {
  const [hovered, sethovered] = useState(false);
  
  const x = useTransform(mousex, (v) => v * (motif.depth * 1.5));
  const y = useTransform(mousey, (v) => v * (motif.depth * 1.5));

  const floatY = -(25 + Math.abs(motif.depth) * 0.8);
  const driftX = motif.depth > 0 ? 20 : -20;
  const rotateDeg = motif.depth > 0 ? 8 : -8;

  return (
    <motion.div
      className="kirana-motif" // Added class for mobile hiding
      style={{ ...motif.style, position: 'absolute', pointerEvents: 'auto', x, y }}
      onHoverStart={() => sethovered(true)}
      onHoverEnd={() => sethovered(false)}
      whileHover={{ scale: 1.15, rotate: motif.depth > 0 ? 6 : -6 }}
    >
      <motion.div
        animate={{ 
          y: [0, floatY, 0], 
          x: [0, driftX, -driftX * 0.5, 0],
          rotate: [0, rotateDeg, -rotateDeg * 0.5, 0] 
        }}
        transition={{ 
          duration: 7 + Math.abs(motif.depth) * 0.15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ 
          filter: hovered ? 'drop-shadow(0px 15px 20px rgba(0,0,0,0.4))' : 'drop-shadow(0px 8px 12px rgba(0,0,0,0.2))', 
          opacity: hovered ? 1 : 0.8, 
          cursor: 'pointer', 
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
        }}
      >
        {motif.svg}
      </motion.div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.8 }}
            style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              marginTop: 16, background: '#fdfbf7',
              border: '2px dashed #b45309', borderRadius: 4,
              padding: '8px 16px', fontSize: 14, fontWeight: 'bold', color: '#78350f',
              whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 10,
              fontFamily: 'Georgia, serif'
            }}
          >
            {motif.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function KiranaBackground() {
  const mousex = useMotionValue(0);
  const mousey = useMotionValue(0);

  useEffect(() => {
    const handlemove = (e: MouseEvent) => {
      mousex.set((e.clientX / window.innerWidth - 0.5) * 2);
      mousey.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', handlemove);
    return () => window.removeEventListener('mousemove', handlemove);
  }, [mousex, mousey]);

  const motifs: motiftype[] = [
    {
      label: "અનાજ • Grains",
      style: { top: '8%', left: '6%', width: 140, height: 140 },
      depth: 25, 
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 90 90">
          <ellipse cx="45" cy="65" rx="35" ry="20" fill="#78350f"/>
          <path d="M15 45 Q 45 70 75 45 L 65 30 Q 45 40 25 30 Z" fill="#b45309"/>
          <ellipse cx="45" cy="30" rx="20" ry="8" fill="#d97706"/>
          <path d="M35 25 L40 15 M45 25 L45 10 M55 25 L50 15" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "તેલ • Oil",
      style: { top: '10%', right: '8%', width: 120, height: 160 },
      depth: -22,
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 70 110">
          <rect x="10" y="35" width="50" height="70" rx="8" fill="#facc15"/>
          <path d="M20 35 L25 15 L45 15 L50 35 Z" fill="#eab308"/>
          <rect x="25" y="5" width="20" height="10" rx="2" fill="#ca8a04"/>
          <circle cx="35" cy="70" r="15" fill="#fef08a" opacity="0.6"/>
        </svg>
      ),
    },
    {
      label: "મસાલા • Spice",
      style: { bottom: '15%', left: '10%', width: 130, height: 110 },
      depth: 28,
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 65 95">
          <path d="M5 40 L32 10 L60 40 L55 90 L10 90 Z" fill="#b45309"/>
          <ellipse cx="32" cy="40" rx="25" ry="12" fill="#ea580c"/>
          <path d="M20 35 Q 32 20 45 35" stroke="#9a3412" strokeWidth="3" fill="none"/>
        </svg>
      ),
    },
    {
      label: "મરચાં • Chillies",
      style: { bottom: '10%', right: '12%', width: 140, height: 120 },
      depth: -30,
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 80 70">
          <path d="M15 60 Q10 40 20 25 Q28 12 35 18 Q38 22 33 28 Q25 32 22 45 Z" fill="#dc2626"/>
          <path d="M45 58 Q42 38 52 23 Q60 10 67 16 Q70 20 65 26 Q57 30 54 43 Z" fill="#b91c1c"/>
          <path d="M35 18 Q30 10 25 5" stroke="#166534" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M67 16 Q65 8 58 2" stroke="#166534" strokeWidth="4" strokeLinecap="round" fill="none"/>
        </svg>
      ),
    },
    {
      label: "ત્રાજવું • Scale",
      style: { top: '45%', right: '5%', width: 150, height: 150 }, 
      depth: 15, 
      svg: (
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <rect x="48" y="10" width="4" height="60" fill="#78350f"/>
          <rect x="20" y="30" width="60" height="4" fill="#92400e"/>
          <path d="M22 34 L10 60 Q 22 70 34 60 L22 34" fill="none" stroke="#a1a1aa" strokeWidth="1.5"/>
          <ellipse cx="22" cy="65" rx="15" ry="4" fill="#d4d4d8"/>
          <path d="M78 34 L66 60 Q 78 70 90 60 L78 34" fill="none" stroke="#a1a1aa" strokeWidth="1.5"/>
          <ellipse cx="78" cy="65" rx="15" ry="4" fill="#d4d4d8"/>
          <path d="M30 90 L70 90 L65 70 L35 70 Z" fill="#451a03"/>
          <circle cx="50" cy="18" r="4" fill="#f59e0b"/>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Inject CSS to perfectly hide the background motifs on narrow mobile screens */}
      <style>{`
        @media (max-width: 768px) {
          .kirana-motif {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, rgba(243, 233, 210, 0.4) 0%, rgba(0,0,0,0) 70%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }} />
        {motifs.map((m) => (
          <FloatingMotif key={m.label} motif={m} mousex={mousex} mousey={mousey} />
        ))}
      </div>
    </>
  );
}