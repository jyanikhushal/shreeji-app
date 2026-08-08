import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useToast } from "@/app/context/ToastContext";
import { subscribeToPushNotifications } from "@/app/utils/pushNotifications";
import { grantGuestNotificationPermission } from "@/app/utils/preorderApi";

// Guest identity is malik-agnostic (preorderGuests/{phone}), but push subscription
// still needs a malikPhone to route through the existing subscribe endpoint —
// same dual-flag pattern as useNotificationPermission, just pointed at preorderGuests.
export function usePreorderNotificationPermission(phone: string | null, malikPhone: string | null) {
  const { showMessage } = useToast();
  const [permissionKnown, setPermissionKnown] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [localGranted, setLocalGranted] = useState(false);

  const getLocalStorageKey = () => `digikhata_push_guest_${phone}`;

  // cross-device granted flag — same system-wide flag philosophy,
  // just read from preorderGuests instead of maliks/.../customers
  useEffect(() => {
    if (!phone) return;
    const guestRef = doc(db, 'preorderGuests', phone);
    const unsubscribe = onSnapshot(guestRef, (snap) => {
      const data = snap.data();
      setNotificationGranted(data?.notificationPermission === 'granted');
      setPermissionKnown(true);
    });
    return () => unsubscribe();
  }, [phone]);

  // per-browser granted flag
  useEffect(() => {
    if (!phone) return;
    const localFlag = localStorage.getItem(getLocalStorageKey()) === 'true';
    setLocalGranted(localFlag);
    if (!localFlag) setShowPermissionModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const handleEnableNotifications = async () => {
    if (!phone || !malikPhone) return;
    setEnabling(true);
    try {
      // Reuses the existing subscribe utility unchanged — backend's
      // subscribeToPush already falls back to preorderGuests when no
      // khata customer doc exists for this phone.
      await subscribeToPushNotifications(malikPhone, phone);
      if (!notificationGranted) await grantGuestNotificationPermission(phone);
      localStorage.setItem(getLocalStorageKey(), 'true');
      setLocalGranted(true);
      setShowPermissionModal(false);
      showMessage("success", "Notifications enabled");
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to enable notifications");
    } finally {
      setEnabling(false);
    }
  };

  const handleDeclineNotifications = () => {
    setShowPermissionModal(false);
  };

  return {
    permissionKnown, notificationGranted, showPermissionModal, enabling, localGranted,
    handleEnableNotifications, handleDeclineNotifications,
  };
}   