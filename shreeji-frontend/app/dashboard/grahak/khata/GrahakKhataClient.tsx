// will reuse the existing khata UI but in read only mode
'use client';
export const dynamic = "force-dynamic";
// all the detail usage of all 4 react hooks are written on top of malik login page

import {useEffect,useState} from  'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';
import {getData} from "@/app/utils/api";

 type Entry={
        entryNo: number;
        date: string;
        description: string;
        amount:number;
        total: number;
    };



export default function GrahakKhataPage(){
   

    const router=useRouter();
    // const searchParams=useSearchParams();
    const {showMessage}=useToast();
    // const phone=searchParams.get("phone");

    const [loading,setLoading]=useState(true);
   const [phone, setPhone] = useState<string | null>(null);

useEffect(() => {
  const sp = new URLSearchParams(window.location.search);
  setPhone(sp.get("phone"));
}, []);

    const [entries,setEntires]=useState<Entry[]>([]);

    // page protection 
    useEffect(()=>{
        const grahak=localStorage.getItem("grahakPhone");

        if(!grahak){
            router.push("/login/grahak");
        }
    },[]);
const [malikPhone, setMalikPhone] = useState<string | null>(null);

useEffect(() => {
  const sp = new URLSearchParams(window.location.search);
  setMalikPhone(sp.get("malikPhone"));
}, []);
    // load khata if logged in
   useEffect(() => {
//   const malikPhone = searchParams.get("malikPhone");

  const loadKhata = async () => {
    if (!phone || !malikPhone) return;

    const isValidPhone = (phone: string): boolean => {
      const cleaned = phone.trim();
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(cleaned);
    };

    if (!isValidPhone(phone)) {
      showMessage("error", "Invalid customer phone");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/khata/${phone}?malikPhone=${malikPhone}`
      );

      // ✅ ALWAYS EXPECT ARRAY
      const data = await getData<Entry[]>(res, { expectArray: true });

      setEntires(data);

    } catch (err: unknown) {
      if (err instanceof Error) {
        showMessage("error", err.message);
      } else {
        showMessage("error", "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  loadKhata();
}, [phone]); // ✅ removed searchParams
const lastTotal = entries.length > 0 ? entries[entries.length-1].total : 0;
if(loading)return <div>Loading...</div>
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
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#14532d' }}>
              My Khata
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
              {phone}
            </p>
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
            onClick={()=>{
              localStorage.removeItem("grahakPhone");
              router.push('/');
            }}
            style={{
              padding:'9px 16px',
              background:'white', color:'#dc2626',
              border:'1.5px solid #fca5a5', borderRadius:10,
              fontSize:13, fontWeight:500,
              cursor:'pointer',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: '1.25rem',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '0.5px solid rgba(200,210,240,0.7)',
            borderRadius: 16, padding: '1rem', textAlign: 'center',
          }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>ENTRIES</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#1e3a8a' }}>{entries.length}</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '0.5px solid rgba(200,210,240,0.7)',
            borderRadius: 16, padding: '1rem', textAlign: 'center',
          }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>PURCHASED</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#dc2626' }}>
              ₹{entries
                .filter(e => !e.description.startsWith('Deposit'))
                .reduce((sum,e) => sum + Math.abs(e.amount), 0)}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '0.5px solid rgba(200,210,240,0.7)',
            borderRadius: 16, padding: '1rem', textAlign: 'center',
          }}>
            <p style={{ margin:0, fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:4 }}>DEPOSITED</p>
            <p style={{ margin:0, fontSize:22, fontWeight:700, color:'#16a34a' }}>
              ₹{entries
                .filter(e => e.description.startsWith('Deposit'))
                .reduce((sum,e) => sum + Math.abs(e.amount), 0)}
            </p>
          </div>
        </div>
      )}

      {/* ── KHATA TABLE ── */}
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
      }}>
        {entries.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#9ca3af', fontSize:15 }}>
            No entries found
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'#f0fdf4' }}>
                {['#','Date','Item','Amount','Total'].map((h)=>(
                  <th key={h} style={{
                    padding: '12px 10px',
                    color: '#14532d', fontWeight:600, fontSize:13,
                    borderBottom: '1.5px solid #bbf7d0',
                    textAlign: h==='Amount'||h==='Total' ? 'right' : 'center',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {entries.map((e, index)=>{
                const isDeposit = e.description.startsWith('Deposit');
                const isLast = index === entries.length - 1;

                return (
                  <tr
                    key={e.entryNo}
                    style={{
                      background: isDeposit ? '#f0fdf4' : isLast ? '#f8faff' : 'white',
                      borderBottom: '0.5px solid #e0e7ef',
                    }}
                  >
                    <td style={{
                      padding:'10px 10px', textAlign:'center',
                      fontSize:13, fontWeight:600,
                      color: isDeposit ? '#16a34a' : '#2563eb',
                    }}>
                      {e.entryNo}
                    </td>

                    <td style={{
                      padding:'10px 10px', textAlign:'center',
                      fontSize:12, color:'#9ca3af', whiteSpace:'nowrap',
                    }}>
                      {e.date}
                    </td>

                    <td style={{
                      padding:'10px 10px', fontSize:14,
                      color: isDeposit ? '#16a34a' : '#111827',
                      fontWeight: isDeposit ? 600 : 400,
                    }}>
                      {e.description}
                    </td>

                    <td style={{
                      padding:'10px 14px', textAlign:'right',
                      fontSize:14, fontWeight:500,
                      color: isDeposit ? '#16a34a' : '#dc2626',
                    }}>
                      {isDeposit ? '-' : '+'}₹{Math.abs(e.amount)}
                    </td>

                    <td style={{
                      padding:'10px 14px', textAlign:'right',
                      fontWeight:700, fontSize:14,
                      color: e.total > 0 ? '#dc2626' : e.total < 0 ? '#16a34a' : '#9ca3af',
                    }}>
                      ₹{e.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr style={{ background: lastTotal > 0 ? '#fee2e2' : '#dcfce7' }}>
                <td colSpan={4} style={{
                  padding:'13px 14px', textAlign:'right',
                  fontWeight:700, fontSize:14,
                  color: lastTotal > 0 ? '#dc2626' : '#16a34a',
                  borderTop: `2px solid ${lastTotal > 0 ? '#fca5a5' : '#86efac'}`,
                }}>
                  {lastTotal > 0 ? 'Amount Due' : 'Credit Balance'}
                </td>
                <td style={{
                  padding:'13px 14px', textAlign:'right',
                  fontWeight:800, fontSize:16,
                  color: lastTotal > 0 ? '#dc2626' : '#16a34a',
                  borderTop: `2px solid ${lastTotal > 0 ? '#fca5a5' : '#86efac'}`,
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