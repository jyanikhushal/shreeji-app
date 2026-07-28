'use client';
import { ReactNode } from "react";
import { motion } from "framer-motion";

type Tone = "ink" | "green" | "brass";

const tones: Record<Tone, { bg: string; text: string; border: string }> = {
  ink:   { bg: "var(--color-ink, #232A3B)", text: "var(--color-paper, #F3E9D2)", border: "var(--color-ink, #232A3B)" },
  green: { bg: "transparent", text: "var(--color-stamp-green, #2F6B4F)", border: "var(--color-stamp-green, #2F6B4F)" },
  brass: { bg: "transparent", text: "var(--color-brass, #B8873B)", border: "var(--color-brass, #B8873B)" },
};

export default function StampButton({
  children, onClick, tone = "ink", icon, disabled = false,
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  tone?: Tone; 
  icon?: ReactNode;
  disabled?: boolean; // Optional property
}) {
  const t = tones[tone];
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, rotate: -0.5 } : {}}
      whileTap={!disabled ? { scale: 0.95, rotate: 1 } : {}}
      style={{
        width: "100%", padding: "15px 18px",
        background: t.bg, color: t.text,
        border: `2px solid ${t.border}`,
        borderRadius: "6px",
        fontFamily: "var(--font-rozha, serif)",
        fontSize: "17px", letterSpacing: "0.5px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, // Visual feedback for disabled state
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        boxShadow: tone === "ink" && !disabled ? "0 4px 0 rgba(0,0,0,0.25)" : "none",
      }}
    >
      {icon}{children}
    </motion.button>
  );
}