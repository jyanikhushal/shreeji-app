import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { isSessionValid, clearSession } from "@/app/utils/session";
import { malik } from "@/types/dashboard";

export function useMalikSession() {
  const { showMessage: showmessage } = useToast();
  const router = useRouter();

  
 const [malikdata] = useState<malik | null>(() => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("malik");
  if (stored && stored !== "undefined") {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
});

  useEffect(() => {
    if (!isSessionValid("malik")) {
      clearSession("malik");
      router.push("/login/malik");
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSessionValid("malik")) {
        clearSession("malik");
        showmessage("error", "session expired. please login again.");
        router.push("/login/malik");
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [router, showmessage]);

  const logout = () => {
    clearSession("malik");
  };

  return { malikdata, logout };
}