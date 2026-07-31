import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useToast } from "@/app/context/ToastContext";
import { subscribeToPushNotifications, initNotificationHistory } from "@/app/utils/pushNotifications";

export function useNotificationPermission(phone: string | null, malikPhone: string | null, authChecked: boolean) {
  const { showMessage } = useToast();
  const [permissionKnown, setPermissionKnown] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [localGranted, setLocalGranted] = useState(false);

  const getLocalStorageKey = () => `digikhata_push_${malikPhone}_${phone}`;

  // cross-device granted flag
  useEffect(() => {
    if (!phone || !malikPhone || !authChecked) return;
    const customerRef = doc(db, 'maliks', malikPhone, 'customers', phone);
    const unsubscribe = onSnapshot(customerRef, (snap) => {
      const data = snap.data();
      setNotificationGranted(data?.notificationPermission === 'granted');
      setPermissionKnown(true);
    });
    return () => unsubscribe();
  }, [phone, malikPhone, authChecked]);

  // per-browser granted flag
  useEffect(() => {
    if (!phone || !malikPhone) return;
    const localFlag = localStorage.getItem(getLocalStorageKey()) === 'true';
    setLocalGranted(localFlag);
    if (!localFlag) setShowPermissionModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, malikPhone]);

  const handleEnableNotifications = async () => {
    if (!phone || !malikPhone) return;
    setEnabling(true);
    try {
      await subscribeToPushNotifications(malikPhone, phone);
      if (!notificationGranted) await initNotificationHistory(malikPhone, phone);
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