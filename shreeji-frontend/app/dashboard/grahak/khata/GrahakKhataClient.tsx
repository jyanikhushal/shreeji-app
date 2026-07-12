'use client';

import { db } from '@/app/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { isSessionValid, clearSession } from '@/app/utils/session';
import { onSnapshot, collection, doc } from 'firebase/firestore';
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

  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [malikPhone, setMalikPhone] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  // notification-related state
  const [permissionKnown, setPermissionKnown] = useState(false); // has the doc loaded yet
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

  // entries listener (unchanged from before)
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

  // Firestore listener — tracks whether ANY device has ever granted (used to skip re-backfilling)
  useEffect(() => {
    if (!phone || !malikPhone || !authChecked) return;

    const customerRef = doc(db, 'maliks', malikPhone, 'customers', phone);
    const unsubscribe = onSnapshot(customerRef, (snap) => {
      const data = snap.data();
      const granted = data?.notificationPermission === 'granted';
      setNotificationGranted(granted);
      setPermissionKnown(true);
    });
    return () => unsubscribe();
  }, [phone, malikPhone, authChecked]);

  // Local (per-browser) check — runs once phone/malikPhone are known.
  // Decides whether THIS browser has already subscribed, independent of Firestore's global flag.
  useEffect(() => {
    if (!phone || !malikPhone) return;
    const localFlag = localStorage.getItem(getLocalStorageKey()) === 'true';
    setLocalGranted(localFlag);
    if (!localFlag) {
      setShowPermissionModal(true);
    }
  }, [phone, malikPhone]);

 const handleEnableNotifications = async () => {
    if (!phone || !malikPhone) return;
    setEnabling(true);
    try {
      // Always subscribe THIS browser — every device needs its own subscription.
      await subscribeToPushNotifications(malikPhone, phone);

      // Only run the one-time backfill if NO device has ever granted before.
      if (!notificationGranted) {
        await initNotificationHistory(malikPhone, phone);
      }

      // Mark this specific browser as subscribed.
      localStorage.setItem(getLocalStorageKey(), 'true');
      setLocalGranted(true);
      setShowPermissionModal(false);
      showMessage("success", "Notifications enabled");
    } catch (err) {
      if (err instanceof Error) {
        showMessage("error", err.message);
      } else {
        showMessage("error", "Failed to enable notifications");
      }
    } finally {
      setEnabling(false);
    }
  };

  const handleDeclineNotifications = () => {
    setShowPermissionModal(false); // no persistence — reappears next visit
  };

  const openHistoryPanel = async () => {
    if (!localGranted || !phone || !malikPhone) return;
    setShowHistoryPanel(true);
    setHistoryLoading(true);
    try {
      const res = await fetchNotificationHistory(malikPhone, phone);
      setHistory(res.history || []);
    } catch (err) {
      showMessage("error", "Failed to load notifications");
    } finally {
      setHistoryLoading(false);
    }
  };

  const lastTotal = entries.length > 0 ? entries[entries.length - 1].total : 0;

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)', borderRadius: 20,
        padding: '2rem 3rem', textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: 15, color: '#6b7280', fontWeight: 500 }}>
          Loading khata...
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      padding: '1.25rem',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)', borderRadius: 20,
        padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.25rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#16a34a', flexShrink: 0,
          }}>
            {(phone||'?').charAt(0)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#14532d' }}>My Khata</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{phone}</p>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap: 10, flexShrink: 0 }}>
          {entries.length > 0 && (
            <div style={{
              background: lastTotal > 0 ? '#fee2e2' : '#dcfce7',
              color: lastTotal > 0 ? '#dc2626' : '#16a34a',
              borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700,
            }}>
              ₹{lastTotal}
            </div>
          )}

          {/* BELL BUTTON */}
          <button
            onClick={openHistoryPanel}
            disabled={!localGranted}
            title={localGranted ? "View notifications" : "Enable notifications first"}
            style={{
              padding: '9px 12px',
              background: localGranted ? '#eff6ff' : '#f3f4f6',
              color: localGranted ? '#2563eb' : '#9ca3af',
              border: `1.5px solid ${localGranted ? '#bfdbfe' : '#e5e7eb'}`,
              borderRadius: 10, fontSize: 15,
              cursor: localGranted ? 'pointer' : 'not-allowed',
            }}
          >
            🔔
          </button>

          <button
            onClick={() => { clearSession("grahak"); router.replace("/login/grahak"); }}
            style={{
              padding:'9px 16px', background:'white', color:'#dc2626',
              border:'1.5px solid #fca5a5', borderRadius:10,
              fontSize:13, fontWeight:500, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      {entries.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:'1.25rem' }}>
          <div style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(200,210,240,0.7)', borderRadius:16, padding:'1rem', textAlign:'center' }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>ENTRIES</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#1e3a8a' }}>{entries.length}</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(200,210,240,0.7)', borderRadius:16, padding:'1rem', textAlign:'center' }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>PURCHASED</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#dc2626' }}>
              ₹{entries.filter(e => !(e.description || '').startsWith('Deposit')).reduce((sum,e) => sum + Math.abs(e.amount), 0)}
            </p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(200,210,240,0.7)', borderRadius:16, padding:'1rem', textAlign:'center' }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>DEPOSITED</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#16a34a' }}>
              ₹{entries.filter(e => (e.description || '').startsWith('Deposit')).reduce((sum,e) => sum + Math.abs(e.amount), 0)}
            </p>
          </div>
        </div>
      )}

      {/* ── KHATA TABLE (unchanged) ── */}
      <div style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(200,210,240,0.7)', borderRadius:20, overflow:'hidden' }}>
        {entries.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#9ca3af', fontSize:15 }}>No entries found</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'#f0fdf4' }}>
                {['#','Date','Item','Amount','Total'].map((h) => (
                  <th key={h} style={{
                    padding:'12px 10px', color:'#14532d', fontWeight:600, fontSize:13,
                    borderBottom:'1.5px solid #bbf7d0',
                    textAlign: h==='Amount'||h==='Total' ? 'right' : 'center',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, index) => {
                const isDeposit = (e.description || '').startsWith('Deposit');
                const isLast = index === entries.length - 1;
                return (
                  <tr key={e.entryNo} style={{
                    background: isDeposit ? '#f0fdf4' : isLast ? '#f8faff' : 'white',
                    borderBottom:'0.5px solid #e0e7ef',
                  }}>
                    <td style={{ padding:'10px 10px', textAlign:'center', fontSize:13, fontWeight:600, color: isDeposit ? '#16a34a' : '#2563eb' }}>{e.entryNo}</td>
                    <td style={{ padding:'10px 10px', textAlign:'center', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>{e.date}</td>
                    <td style={{ padding:'10px 10px', fontSize:14, color: isDeposit ? '#16a34a' : '#111827', fontWeight: isDeposit ? 600 : 400 }}>{(e.description || '')}</td>
                    <td style={{ padding:'10px 14px', textAlign:'right', fontSize:14, fontWeight:500, color: isDeposit ? '#16a34a' : '#dc2626' }}>
                      {isDeposit ? '-' : '+'}₹{Math.abs(e.amount)}
                    </td>
                    <td style={{ padding:'10px 14px', textAlign:'right', fontWeight:700, fontSize:14, color: e.total > 0 ? '#dc2626' : e.total < 0 ? '#16a34a' : '#9ca3af' }}>
                      ₹{e.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: lastTotal > 0 ? '#fee2e2' : '#dcfce7' }}>
                <td colSpan={4} style={{
                  padding:'13px 14px', textAlign:'right', fontWeight:700, fontSize:14,
                  color: lastTotal > 0 ? '#dc2626' : '#16a34a',
                  borderTop:`2px solid ${lastTotal > 0 ? '#fca5a5' : '#86efac'}`,
                }}>
                  {lastTotal > 0 ? 'Amount Due' : 'Credit Balance'}
                </td>
                <td style={{
                  padding:'13px 14px', textAlign:'right', fontWeight:800, fontSize:16,
                  color: lastTotal > 0 ? '#dc2626' : '#16a34a',
                  borderTop:`2px solid ${lastTotal > 0 ? '#fca5a5' : '#86efac'}`,
                }}>
                  ₹{Math.abs(lastTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <p style={{ textAlign:'center', fontSize:12, color:'#9ca3af', marginTop:16 }}>
        Read-only view · Contact your store for any changes
      </p>

      {/* ── PERMISSION MODAL (blocking) ── */}
      {permissionKnown && showPermissionModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            background:'white', borderRadius:20, padding:32, width:320,
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <h2 style={{ fontWeight:700, marginBottom:8, color:'#111', fontSize:18 }}>
              Enable Notifications?
            </h2>
            <p style={{ color:'#6b7280', fontSize:14, marginBottom:24, lineHeight:1.5 }}>
              Get notified instantly when a deposit is recorded, and reminders when payment is due.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={handleDeclineNotifications}
                disabled={enabling}
                style={{
                  flex:1, padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:10,
                  background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500,
                }}
              >
                Not now
              </button>
              <button
                onClick={handleEnableNotifications}
                disabled={enabling}
                style={{
                  flex:1, padding:'11px 0', background:'#2563eb', color:'white',
                  border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700,
                }}
              >
                {enabling ? 'Enabling...' : 'Yes, enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION HISTORY PANEL ── */}
      {showHistoryPanel && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
          onClick={() => setShowHistoryPanel(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:'white', borderRadius:16, padding:20, width:340,
              maxHeight:'70vh', overflowY:'auto', boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontWeight:700, marginBottom:12, color:'#111', fontSize:16 }}>Notifications</h2>
            {historyLoading ? (
              <p style={{ color:'#9ca3af', fontSize:14, textAlign:'center' }}>Loading...</p>
            ) : history.length === 0 ? (
              <p style={{ color:'#9ca3af', fontSize:14, textAlign:'center' }}>No notifications yet</p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{
                  padding:'10px 0', borderBottom:'1px solid #f3f4f6',
                }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#111' }}>{item.title}</p>
                  <p style={{ margin:'2px 0', fontSize:13, color:'#374151' }}>{item.body}</p>
                  <p style={{ margin:0, fontSize:11, color:'#9ca3af' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            <button
              onClick={() => setShowHistoryPanel(false)}
              style={{
                width:'100%', marginTop:14, padding:'10px 0', border:'1px solid #e5e7eb',
                borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:14,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}