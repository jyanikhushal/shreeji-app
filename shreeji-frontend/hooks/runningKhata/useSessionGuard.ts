import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { isSessionValid, clearSession } from "@/app/utils/session";

export function useSessionGuard() {
  const { showMessage: showmessage } = useToast();
  const router = useRouter();

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
        showmessage("error", "Session expired.Please login again.");
        router.push("/login/malik");
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [router, showmessage]);
}