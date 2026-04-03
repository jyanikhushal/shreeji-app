"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isSessionValid } from "@/app/utils/session";
type Shop = {
  malikPhone: string;
  shopName: string;
  malikName: string;
};

export default function GrahakShopsPage() {
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const {showMessage}=useToast();
  const [grahakPhone, setGrahakPhone] = useState<string | null>(null);
  useEffect(() => {
  if (!loading && shops.length === 0) {
    showMessage("info", "No shops found");
  }
}, [shops.length, loading]);
  // 🔐 Protect page
  let phone;
 useEffect(() => {
  if (!isSessionValid("grahak")) {
    router.push("/login/grahak");
  } else {
     phone = localStorage.getItem("grahakPhone");
    setGrahakPhone(phone);
    router.push("/dashboard/grahak/shops");
    console.log("grahak phone:",phone);
    
  }
}, [router]);
// const grahakPhone = localStorage.getItem("grahakPhone");
  // 📦 Fetch shops
  useEffect(() => {
    if(!phone)return;
    const fetchShops = async () => {
      

      try {
        const res = await fetch( // fetch req
          `${process.env.NEXT_PUBLIC_API_URL}/grahak/shops/${grahakPhone}`
        );
        const data = await getData<Shop[]>(res, { expectArray: true });

           setShops(data);
      } catch (err) {
        console.error("Error fetching shops:", err);
        if (err instanceof Error) {
        showMessage("error", err.message);
      } else {
        showMessage("error", "Error in fetching shops");
      }
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [grahakPhone]);

  // ⏳ Loading UI
if (loading) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: 20, padding: '2rem 3rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <p style={{ margin: 0, fontSize: 15, color: '#6b7280', fontWeight: 500 }}>
          Loading your shops...
        </p>
      </div>
    </div>
  );
}



// ❌ No shops

if(shops.length===0){
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: 24, padding: '2.5rem',
        textAlign: 'center', maxWidth: 360, width: '100%',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#111827' }}>
          No shops found
        </p>
        <p style={{ margin: '8px 0 24px', fontSize: 13, color: '#9ca3af' }}>
          You have not been added to any shop yet. Contact your store owner to get added.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("grahakPhone");
            router.push('/');
          }}
          style={{
            width: '100%', padding: '12px',
            background: 'white', color: '#dc2626',
            border: '1.5px solid #fca5a5', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}


// ── MAIN RETURN ──
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
      marginBottom: '1.5rem',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: '#16a34a', flexShrink: 0,
        }}>
          {(grahakPhone||'?').charAt(0)}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#14532d' }}>
            Select Your Shop
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
            {grahakPhone}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("grahakPhone");
          router.push('/');
        }}
        style={{
          padding: '9px 16px',
          background: 'white', color: '#dc2626',
          border: '1.5px solid #fca5a5', borderRadius: 10,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
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

    {/* ── SHOP COUNT HINT ── */}
    <p style={{
      textAlign: 'center', fontSize: 13,
      color: '#6b7280', marginBottom: '1rem',
    }}>
      {shops.length} {shops.length === 1 ? 'shop' : 'shops'} linked to your account
    </p>

    {/* ── SHOP CARDS ── */}
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: 12, maxWidth: 480, margin: '0 auto',
    }}>
      {shops.map((shop) => (
        <div
          key={shop.malikPhone}
          onClick={() => {
            router.push(
              `/dashboard/grahak/khata?phone=${grahakPhone}&malikPhone=${shop.malikPhone}`
            );
          }}
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '0.5px solid rgba(200,210,240,0.7)',
            borderRadius: 18,
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.98)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.88)')}
        >
          <div style={{ display:'flex', alignItems:'center', gap: 14 }}>

            {/* Shop icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#dbeafe', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e3a8a' }}>
                {shop.shopName}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
                Owner: {shop.malikName}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      ))}
    </div>

  </div>
);
}