'use client';

import { db } from '@/app/firebase';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { isSessionValid, clearSession } from '@/app/utils/session';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import KiranaBackground from "@/components/home/KiranaBackground";
import StampButton from "@/components/ui/StampButton";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";
import {
  subscribeToPushNotifications,
  initNotificationHistory,
  fetchNotificationHistory,
} from '@/app/utils/pushNotifications';

type Entry = {
  entryNo: number;
  date: string;
  description: string;
  amount: number;
  total: number;
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
};

export default function GrahakKhataClient() {
  const router = useRouter();
  const { showMessage } = useToast();
  const { navigateTo, stamping } = useNavTransition();

  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [malikPhone, setMalikPhone] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  // ── NEW: REF FOR AUTO-SCROLLING TO BOTTOM OF TABLE ──
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);

  // notification-related state — unchanged
  const [permissionKnown, setPermissionKnown] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [localGranted, setLocalGranted] = useState(false);

  const getLocalStorageKey = () => `digikhata_push_${malikPhone}_${phone}`;

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setPhone(sp.get("phone"));
    setMalikPhone(sp.get("malikPhone"));
  }, []);

  useEffect(() => {
    if (!isSessionValid("grahak")) {
      router.replace("/login/grahak");
      return;
    }
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidPhone = (p: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(p.trim());
  };

  // entries listener — unchanged
  useEffect(() => {
    if (!phone || !malikPhone || !authChecked) return;
    if (!isValidPhone(phone)) {
      showMessage("error", "Invalid customer phone");
      return;
    }

    const entriesRef = collection(db, 'maliks', malikPhone, 'customers', phone, 'entries');
    const unsubscribe = onSnapshot(
      entriesRef,
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            entryNo: d.entryNo || 0,
            description: d.description || '',
            amount: d.amount || 0,
            total: d.total || 0,
            date: d.date?.toDate().toLocaleDateString() || '',
          };
        });
        const sorted = data.sort((a, b) => (a.entryNo || 0) - (b.entryNo || 0));
        setEntries(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        showMessage("error", err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [phone, malikPhone, authChecked]);

  // ── NEW: AUTO SCROLL DOWN WHEN ENTRIES LOAD OR CHANGE ──
  useEffect(() => {
    if (entries.length > 0) {
      lastRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [entries]);

  // cross-device granted flag — unchanged
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

  // per-browser granted flag — unchanged
  useEffect(() => {
    if (!phone || !malikPhone) return;
    const localFlag = localStorage.getItem(getLocalStorageKey()) === 'true';
    setLocalGranted(localFlag);
    if (!localFlag) setShowPermissionModal(true);
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

  const openHistoryPanel = async () => {
    if (!localGranted || !phone || !malikPhone) return;
    setShowHistoryPanel(true);
    setHistoryLoading(true);
    try {
      const res = await fetchNotificationHistory(malikPhone, phone);
      setHistory(res.history || []);
    } catch {
      showMessage("error", "Failed to load notifications");
    } finally {
      setHistoryLoading(false);
    }
  };

  const lastTotal = entries.length > 0 ? entries[entries.length - 1].total : 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: 'var(--color-paper)', borderRadius: 4,
          borderLeft: '6px solid var(--color-rule-red)',
          padding: 'clamp(1.25rem, 4vw, 1.75rem) clamp(1.5rem, 5vw, 2.5rem)', 
          boxShadow: '0 12px 30px rgba(35,42,59,0.2)',
        }}>
          <p style={{ margin: 0, fontSize: 'clamp(14px, 4vw, 15px)', color: 'var(--color-ink)', fontWeight: 500, fontFamily: 'var(--font-rozha, serif)' }}>
            Opening your khata...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      padding: 'clamp(0.75rem, 3vw, 1.25rem)', 
      position: 'relative',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        maxWidth: '800px', 
        margin: '0 auto',
        width: '100%',
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>

        {/* ── TOP BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            flexShrink: 0,
            background: 'var(--color-paper)', borderRadius: 4,
            borderLeft: '6px solid var(--color-brass)',
            padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 3vw, 1.25rem)', 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center', 
            gap: 12,
            marginBottom: '1.25rem',
            boxShadow: '0 8px 24px rgba(35,42,59,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: 'var(--color-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
            }}>
              {(phone || '?').charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 17px)', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-rozha, serif)' }}>My Khata</p>
              <p style={{ margin: '2px 0 0', fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--color-ink)', opacity: 0.6 }}>{phone}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 'auto' }}>
            {entries.length > 0 && (
              <div style={{
                background: 'transparent',
                border: `1.5px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
                color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
                borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700,
              }}>
                ₹{lastTotal}
              </div>
            )}

            <StampButton tone="brass" onClick={openHistoryPanel} disabled={!localGranted}>
              <motion.div
                animate={{
                  rotate: [0, 18, -18, 12, -12, 6, -6, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5, // Rings briskly, pauses for 1.5s, then rings again
                  ease: "easeInOut",
                }}
                style={{
                  display: 'inline-block',
                  fontSize: 30, // ── BIGGER BELL ICON ──
                  transformOrigin: 'top center', // Swings from the top pivot like a real bell
                  lineHeight: 1,
                }}
              >
                🔔
              </motion.div>
            </StampButton>

            <StampButton
              tone="ink"
              onClick={() => { clearSession("grahak"); navigateTo("/login/grahak"); }}
            >
              Logout
            </StampButton>
          </div>
        </motion.div>

        {/* ── SUMMARY CARDS ── */}
        {entries.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: 12, 
            marginBottom: '1.25rem',
            flexShrink: 0 
          }}>
            {[
              { label: 'ENTRIES', value: entries.length, color: 'var(--color-ink)' },
              {
                label: 'PURCHASED',
                value: `₹${entries.filter(e => !(e.description || '').startsWith('Deposit')).reduce((s, e) => s + Math.abs(e.amount), 0)}`,
                color: 'var(--color-rule-red)',
              },
              {
                label: 'DEPOSITED',
                value: `₹${entries.filter(e => (e.description || '').startsWith('Deposit')).reduce((s, e) => s + Math.abs(e.amount), 0)}`,
                color: 'var(--color-stamp-green)',
              },
            ].map((card) => (
              <div key={card.label} style={{
                background: 'var(--color-paper)', borderRadius: 6,
                borderTop: '3px solid var(--color-brass)',
                padding: 'clamp(0.75rem, 3vw, 1rem)', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(35,42,59,0.1)',
              }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-ink)', opacity: 0.6, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 4 }}>
                  {card.label}
                </p>
                <p style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 21px)', fontWeight: 700, color: card.color, fontFamily: 'var(--font-rozha, serif)' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── KHATA TABLE ── */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          minHeight: 0, 
          background: 'var(--color-paper)', 
          borderRadius: 6, 
          boxShadow: '0 8px 24px rgba(35,42,59,0.12)' 
        }}>
          {entries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-ink)', opacity: 0.5, fontSize: 15 }}>
              No entries found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
              <thead>
                <tr>
                  {['#', 'Date', 'Item', 'Amount', 'Total'].map((h) => (
                    <th key={h} style={{
                      position: 'sticky', 
                      top: 0,
                      zIndex: 50,
                      background: '#DED0AC',
                      padding: '12px clamp(6px, 2vw, 10px)', color: 'var(--color-ink)', fontWeight: 600, fontSize: 13,
                      borderBottom: '2px solid var(--color-brass)',
                      textAlign: h === 'Amount' || h === 'Total' ? 'right' : 'center',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, index) => {
                  const isDeposit = (e.description || '').startsWith('Deposit');
                  const isLast = index === entries.length - 1;
                  return (
                    <tr 
                      key={e.entryNo} 
                      ref={isLast ? lastRowRef : null} // ── ATTACH REF TO LAST ROW ──
                      style={{
                        background: isDeposit ? 'rgba(47,107,79,0.07)' : isLast ? 'rgba(184,135,59,0.07)' : 'transparent',
                        borderBottom: '1px solid rgba(35,42,59,0.08)',
                      }}
                    >
                      <td style={{ padding: '10px clamp(4px, 2vw, 10px)', textAlign: 'center', fontSize: 13, fontWeight: 600, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-brass)' }}>
                        {e.entryNo}
                      </td>
                      <td style={{ padding: '10px clamp(4px, 2vw, 10px)', textAlign: 'center', fontSize: 12, color: 'var(--color-ink)', opacity: 0.55, whiteSpace: 'nowrap' }}>
                        {e.date}
                      </td>
                      <td style={{ padding: '10px clamp(4px, 2vw, 10px)', fontSize: 14, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-ink)', fontWeight: isDeposit ? 600 : 400 }}>
                        {e.description || ''}
                      </td>
                      <td style={{ padding: '10px clamp(6px, 2vw, 14px)', textAlign: 'right', fontSize: 14, fontWeight: 500, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-rule-red)' }}>
                        {isDeposit ? '-' : '+'}₹{Math.abs(e.amount)}
                      </td>
                      <td style={{
                        padding: '10px clamp(6px, 2vw, 14px)', textAlign: 'right', fontWeight: 700, fontSize: 14,
                        color: e.total > 0 ? 'var(--color-rule-red)' : e.total < 0 ? 'var(--color-stamp-green)' : 'var(--color-ink)',
                      }}>
                        ₹{e.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: lastTotal > 0 ? 'rgba(180,67,63,0.1)' : 'rgba(47,107,79,0.1)' }}>
                  <td colSpan={4} style={{
                    padding: '13px clamp(8px, 2vw, 14px)', textAlign: 'right', fontWeight: 700, fontSize: 14,
                    color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
                    borderTop: `2px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
                  }}>
                    {lastTotal > 0 ? 'Amount Due' : 'Credit Balance'}
                  </td>
                  <td style={{
                    padding: '13px clamp(8px, 2vw, 14px)', textAlign: 'right', fontWeight: 800, fontSize: 16,
                    color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
                    borderTop: `2px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
                  }}>
                    ₹{Math.abs(lastTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink)', opacity: 0.5, marginTop: 16, flexShrink: 0 }}>
          Read-only view · Contact your store for any changes
        </p>
      </div>

      {/* ── PERMISSION MODAL (blocking) ── */}
      <AnimatePresence>
        {permissionKnown && showPermissionModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{
                background: '#FFFFFF',
                borderRadius: 6, 
                padding: 'clamp(1.5rem, 5vw, 2rem)', 
                width: 'calc(100% - 2rem)', 
                maxWidth: 340,
                borderLeft: '6px solid var(--color-brass)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <h2 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-ink)', fontSize: 'clamp(17px, 5vw, 19px)', fontFamily: 'var(--font-rozha, serif)' }}>
                Enable Notifications?
              </h2>
              <p style={{ color: 'var(--color-ink)', opacity: 0.7, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Get notified instantly when a deposit is recorded, and reminders when payment is due.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <StampButton tone="brass" onClick={handleDeclineNotifications} disabled={enabling}>
                    Not now
                  </StampButton>
                </div>
                <div style={{ flex: 1 }}>
                  <StampButton tone="ink" onClick={handleEnableNotifications} disabled={enabling}>
                    {enabling ? 'Enabling...' : 'Yes, enable'}
                  </StampButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOTIFICATION HISTORY PANEL ── */}
      <AnimatePresence>
        {showHistoryPanel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowHistoryPanel(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--color-paper)', borderRadius: 6, padding: 20, 
                width: 'calc(100% - 2rem)', 
                maxWidth: 360,
                borderLeft: '6px solid var(--color-brass)',
                maxHeight: '70vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              }}
            >
              <h2 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--color-ink)', fontSize: 17, fontFamily: 'var(--font-rozha, serif)' }}>
                Notifications
              </h2>
              {historyLoading ? (
                <p style={{ color: 'var(--color-ink)', opacity: 0.5, fontSize: 14, textAlign: 'center' }}>Loading...</p>
              ) : history.length === 0 ? (
                <p style={{ color: 'var(--color-ink)', opacity: 0.5, fontSize: 14, textAlign: 'center' }}>No notifications yet</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} style={{
                    padding: '10px 0',
                    borderBottom: '1px dashed rgba(35,42,59,0.2)',
                  }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{item.title}</p>
                    <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--color-ink)', opacity: 0.75 }}>{item.body}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-ink)', opacity: 0.5 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
              <div style={{ marginTop: 14 }}>
                <StampButton tone="brass" onClick={() => setShowHistoryPanel(false)}>
                  Close
                </StampButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}