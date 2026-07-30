'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isSessionValid, clearSession } from "@/app/utils/session";
import { motion } from "framer-motion";
import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";

type Shop = {
  malikPhone: string;
  shopName: string;
  malikName: string;
};

export default function GrahakShopsPage() {
  const router = useRouter();
  const { showMessage: showmessage } = useToast();
  const { navigateTo: navigateto, stamping } = useNavTransition();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [grahakPhone, setGrahakPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionValid("grahak")) {
      router.replace("/login/grahak");
      return;
    }
    const phone = localStorage.getItem("grahakPhone");
    if (!phone) {
      router.replace("/login/grahak");
      return;
    }
    setGrahakPhone(phone);
  }, [router]);

  useEffect(() => {
    if (!grahakPhone) return;

    const fetchShops = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/shops/${grahakPhone}`);
        const data = await getData<Shop[]>(res, { expectArray: true });
        setShops(data);
      } catch (err) {
        console.error("Error fetching shops:", err);
        showmessage("error", "Error in fetching shops");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [grahakPhone, showmessage]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        padding: '1rem'
      }}>
        <p style={{ color: 'var(--color-ink)', fontWeight: 600, fontSize: '16px' }}>Loading your shops...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', 
      padding: 'clamp(1rem, 5vw, 2rem)',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}
      >
        {/* Top Header */}
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', 
          justifyContent: 'space-between', gap: '12px', marginBottom: '2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: '#E8E4D9', border: '2px solid #A88D5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative', flexShrink: 0
            }}>
              <Image src="/digiKhata-logo.png" alt="logo" fill style={{ objectFit: 'cover' }} priority />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 20px)', color: 'var(--color-ink)', fontWeight: 700 }}>
                Select Shop
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 'clamp(12px, 3.5vw, 13px)', opacity: 0.7, color: 'var(--color-ink)' }}>
                {grahakPhone}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { clearSession("grahak"); navigateto('/login/grahak'); }} 
            style={{ 
              background: 'transparent', border: '1.5px solid var(--color-rule-red)', 
              color: 'var(--color-rule-red)', padding: '8px 14px', borderRadius: '6px', 
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Shop List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shops.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '2.5rem 1rem', 
              background: 'var(--color-paper)', borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(35,42,59,0.1)'
            }}>
              <p style={{ margin: 0, color: 'var(--color-ink)', opacity: 0.7, fontWeight: 500 }}>No shops found.</p>
            </div>
          ) : (
            shops.map((shop, i) => (
              <motion.div
                key={shop.malikPhone}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigateto(`/dashboard/grahak/khata?phone=${grahakPhone}&malikPhone=${shop.malikPhone}`)}
                style={{
                  background: 'var(--color-paper)',
                  padding: 'clamp(1rem, 4vw, 1.25rem)', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(35,42,59,0.1)',
                  borderLeft: '5px solid var(--color-brass)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(35,42,59,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(35,42,59,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '8px', 
                    background: 'var(--color-ink)', color: 'var(--color-paper)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 700, fontSize: '18px', flexShrink: 0
                  }}>
                    {shop.shopName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'clamp(15px, 4vw, 16px)', color: 'var(--color-ink)' }}>
                      {shop.shopName}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 'clamp(12px, 3.5vw, 13px)', opacity: 0.7, color: 'var(--color-ink)' }}>
                      Owner: {shop.malikName}
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}