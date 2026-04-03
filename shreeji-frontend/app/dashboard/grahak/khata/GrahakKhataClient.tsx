// will reuse the existing khata UI but in read only mode
'use client';
export const dynamic = "force-dynamic";

import {db} from '@/app/firebase';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import { isSessionValid,clearSession } from '@/app/utils/session';
import {onSnapshot,collection} from 'firebase/firestore'; // as we are using firebase it has onsnapshotlisteners that fires instantly whenver data changes same like trigger

type Entry = {
  entryNo: number;
  date: string;
  description: string;
  amount: number;
  total: number;
};

// ── INNER COMPONENT (does all the real work) ──
function GrahakKhataInner() {
   const router = useRouter();
  const { showMessage } = useToast();

  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [malikPhone, setMalikPhone] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ FIX 1: Get URL params from window
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setPhone(sp.get("phone"));
    setMalikPhone(sp.get("malikPhone"));
  }, []);

  // ✅ FIX 2: Auth check — separate, runs once on mount
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

  // ✅ FIX 3: Firestore listener — only runs when ALL 3 are ready
  useEffect(() => {
    if (!phone || !malikPhone || !authChecked) return;

    if (!isValidPhone(phone)) {
      showMessage("error", "Invalid customer phone");
      return;
    }

    const entriesRef = collection(
      db, 'maliks', malikPhone, 'customers', phone, 'entries'
    );

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
  }, [phone, malikPhone, authChecked]); // ✅ all 3 dependencies correct

  const lastTotal = entries.length > 0 ? entries[entries.length - 1].total : 0;

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: 20, padding: '2rem 3rem', textAlign: 'center',
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
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: 20,
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: '#dcfce7',
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
              borderRadius: 20, padding: '5px 14px',
              fontSize: 13, fontWeight: 700,
            }}>
              ₹{lastTotal}
            </div>
          )}
          <button
            onClick={() => {
              clearSession("grahak");
                  router.replace("/login/grahak");
            }}
            style={{
              padding:'9px 16px',
              background:'white', color:'#dc2626',
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

      {/* ── KHATA TABLE ── */}
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
    </div>
  );
}

// ── OUTER PAGE — wraps inner in Suspense so Next.js build doesn't crash ──
export default function GrahakKhataPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'rgba(255,255,255,0.88)',
          backdropFilter:'blur(16px)',
          border:'0.5px solid rgba(200,210,240,0.7)',
          borderRadius:20, padding:'2rem 3rem', textAlign:'center',
        }}>
          <p style={{ margin:0, fontSize:15, color:'#6b7280', fontWeight:500 }}>
            Loading...
          </p>
        </div>
      </div>
    }>
      <GrahakKhataInner />
    </Suspense>
  );
}