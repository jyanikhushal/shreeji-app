'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isSessionValid, clearSession } from "@/app/utils/session";
import { motion, AnimatePresence } from "framer-motion";
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)' }}>
        <p style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Loading your shops...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '2rem',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 2 }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: '#E8E4D9', border: '2px solid #A88D5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative'
            }}>
              <Image src="/digiKhata-logo.png" alt="logo" fill style={{ objectFit: 'cover' }} priority />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', color: 'var(--color-ink)' }}>Select Shop</h1>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>{grahakPhone}</p>
            </div>
          </div>
          <button onClick={() => { clearSession("grahak"); navigateto('/login/grahak'); }} style={{ background: 'transparent', border: '1px solid var(--color-rule-red)', color: 'var(--color-rule-red)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            Logout
          </button>
        </div>

        {/* Shop List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-paper)', borderRadius: '12px' }}>
              <p>No shops found.</p>
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
                  padding: '1.25rem', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(35,42,59,0.1)',
                  borderLeft: '4px solid var(--color-brass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--color-ink)', color: 'var(--color-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {shop.shopName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{shop.shopName}</p>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Owner: {shop.malikName}</p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}