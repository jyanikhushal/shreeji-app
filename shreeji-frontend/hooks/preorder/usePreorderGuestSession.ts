import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionValid, clearSession, saveSession } from "@/app/utils/session";
import { preorderGuestLogin, preorderGuestSetName, checkKhataMatch } from "@/app/utils/preorderApi";
import { useToast } from "@/app/context/ToastContext";

type ViewState = "choice" | "consent" | "name" | "order" | "khata";

export function usePreorderGuestSession(malikPhone: string) {
  const router = useRouter();
  const { showMessage } = useToast();

  const [phone] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("preorderGuestPhone");
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [nameLoaded, setNameLoaded] = useState(false);
  const [view, setView] = useState<ViewState>("choice");
  const [savingName, setSavingName] = useState(false);
  const [checkingKhata, setCheckingKhata] = useState(false);
  const [showNoKhataPopup, setShowNoKhataPopup] = useState(false);

  useEffect(() => {
    if (!isSessionValid("preorderGuest")) {
      router.replace("/preorder");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  // Fetch existing guest name once auth is confirmed — preorderGuestLogin is
  // idempotent, so this is safe to call on every visit; it just returns the
  // existing doc (with name, if already set) rather than creating a new one.
  useEffect(() => {
    if (!authChecked || !phone) return;
    let cancelled = false;
    preorderGuestLogin(phone)
      .then((guest) => {
        if (!cancelled) {
          setName(guest.name);
          setNameLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNameLoaded(true); // fail open — will fall through to name screen
      });
    return () => { cancelled = true; };
  }, [authChecked, phone]);

  const chooseOrder = () => setView("consent");

  const chooseKhata = async () => {
    if (!phone) return;
    setCheckingKhata(true);
    try {
      const match = await checkKhataMatch(malikPhone, phone);
      if (match) {
        saveSession(phone, "grahak");
        router.push(`/dashboard/grahak/khata?phone=${phone}&malikPhone=${malikPhone}`);
      } else {
        setShowNoKhataPopup(true);
      }
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to check khata");
    } finally {
      setCheckingKhata(false);
    }
  };

  const closeNoKhataPopup = () => setShowNoKhataPopup(false);

  const proceedToName = (existingName: string | null) => {
    if (existingName) {
      setName(existingName);
      setView("order");
    } else {
      setView("name");
    }
  };

  const submitName = async (typedName: string) => {
    if (!phone || !typedName.trim()) return;
    setSavingName(true);
    try {
      const guest = await preorderGuestSetName(phone, typedName.trim());
      setName(guest.name);
      setView("order");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to save name");
    } finally {
      setSavingName(false);
    }
  };

  const logout = () => {
    clearSession("preorderGuest");
    router.replace("/preorder");
  };

  return {
    phone, name, nameLoaded, authChecked, view, savingName, checkingKhata, showNoKhataPopup,
    chooseOrder, chooseKhata, closeNoKhataPopup, proceedToName, submitName, logout,
  };
}