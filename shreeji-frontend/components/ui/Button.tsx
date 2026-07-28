'use client';

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "success";

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary, #2563eb)",
    color: "white",
    border: "none",
  },
  secondary: {
    background: "white",
    color: "var(--color-primary-dark, #1e40af)",
    border: "1.5px solid #93c5fd",
  },
  success: {
    background: "var(--color-success-light, #f0fdf4)",
    color: "#166534",
    border: "1.5px solid var(--color-success-border, #86efac)",
  },
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  loading = false,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: "var(--radius-md)",
        fontSize: "17px",
        fontWeight: 600,
        cursor: loading ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        ...variantStyles[variant],
      }}
    >
      {loading ? <Spinner size={18} color={variant === "primary" ? "white" : "#2563eb"} /> : icon}
      {children}
    </motion.button>
  );
}