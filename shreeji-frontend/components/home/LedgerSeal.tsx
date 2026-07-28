'use client';
import { motion } from "framer-motion";
import Image from "next/image";

export default function LedgerSeal() {
  return (
    <motion.div
      initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      style={{
        width: 88, height: 88, borderRadius: "50%",
        background: "var(--color-brass)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 6px 0 rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.2)",
        border: "3px solid #9c7530",
        padding: 0,
      }}
    >
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "var(--color-paper)",
        overflow: "hidden",
        position: "relative",
      }}>
        <Image
          src="/digiKhata-logo.png"
          alt="digiKhata"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </motion.div>
  );
}