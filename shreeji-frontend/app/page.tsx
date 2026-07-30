'use client';
export const dynamic = "force-dynamic";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import KiranaBackground from "@/components/home/KiranaBackground";
import LedgerSeal from "@/components/home/LedgerSeal";
import StampButton from "@/components/ui/StampButton";
import PageLoader from "@/components/ui/PageLoader";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";

export default function HomePage() {
  const router = useRouter();
  const { navigateTo, stamping } = useNavTransition();
  const [isMalik] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("malik")
  );

  useEffect(() => {
    if (isMalik) router.replace("/dashboard/malik");
  }, [isMalik, router]);

  if (isMalik) return <PageLoader />;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', 
      /* Fluid safe area padding: 1rem on mobile, 2rem on desktop */
      padding: 'clamp(1rem, 5vw, 2rem)', 
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{
          background: 'var(--color-paper)',
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '440px',
          /* Fluid padding inside the card */
          padding: 'clamp(2rem, 6vw, 2.75rem) clamp(1.5rem, 5vw, 2.5rem)',
          borderRadius: '4px',
          boxShadow: '0 20px 50px rgba(35,42,59,0.25)',
          borderLeft: '6px solid var(--color-rule-red)',
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 38px,
            rgba(35,42,59,0.06) 39px, transparent 40px
          )`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
          <LedgerSeal />

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-rozha, serif)', 
              /* Fluid font size for title */
              fontSize: 'clamp(26px, 6vw, 32px)',
              color: 'var(--color-ink)', margin: 0, fontWeight: 400,
            }}>
              digiKhata
            </h1>
            <p style={{ 
              fontSize: 'clamp(12px, 3vw, 14px)', 
              color: 'var(--color-ink)', opacity: 0.65, margin: '4px 0 0', 
              letterSpacing: '1px', textTransform: 'uppercase' 
            }}>
              Kirana Stores
            </p>
            <p style={{
              fontSize: 'clamp(13px, 3.5vw, 15px)', 
              color: 'var(--color-ink)', opacity: 0.8, margin: '10px 0 0',
              fontFamily: 'var(--font-noto-gujarati)',
            }}>
              તમારો ભરોસો, અમારી જવાબદારી
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {[
              { label: "Malik Login", route: "/login/malik", tone: "ink" as const },
              { label: "Grahak Login", route: "/login/grahak", tone: "green" as const },
              { label: "New Malik Signup", route: "/signup/malik", tone: "brass" as const },
            ].map((btn, i) => (
              <motion.div
                key={btn.route}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.35 }}
              >
                <StampButton tone={btn.tone} onClick={() => navigateTo(btn.route)}>
                  {btn.label}
                </StampButton>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}