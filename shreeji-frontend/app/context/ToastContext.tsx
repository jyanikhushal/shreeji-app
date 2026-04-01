'use client';

import { createContext, useContext } from "react";

type ToastType = "success" | "error" | "info";

type ToastContextType = {
  showMessage: (type: ToastType, message: string) => void;
};

// 👇 properly typed context
export const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};