'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { saveSession } from '@/app/utils/session';
import { motion } from 'framer-motion';
import KiranaBackground from "@/components/home/KiranaBackground";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";
import { useTranslation } from 'react-i18next';

type grahak = {
  _id: string;
  name: string;
  phone: string;
};

export default function GrahakLoginPage() {
  const [phone, setphone] = useState('');
  const { showMessage: showmessage } = useToast();
  const router = useRouter();
  const { navigateTo: navigateto, stamping } = useNavTransition();
  const { t } = useTranslation('login');
  const [loading, setloading] = useState(false);

  const handlelogin = async () => {
    if (!phone) {
      showmessage("error", t('errors.enterPhone'));
      return;
    }

    const isvalidphone = (p: string): boolean => {
      const cleaned = p.trim();
      const regex = /^[6-9]\d{9}$/;
      return regex.test(cleaned);
    };

    if (!isvalidphone(phone)) {
      showmessage("error", t('errors.invalidPhone'));
      return;
    }
    
    setloading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/grahak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }) 
      });

      const grahakdata = await getData<grahak>(res);

      if (!grahakdata) {
        showmessage("error", t('errors.invalidResponse'));
        setloading(false);
        return;
      }

      showmessage("success", t('loginSuccess'));
      localStorage.setItem("grahak", JSON.stringify(grahakdata));
      saveSession(phone, "grahak");
      navigateto("/dashboard/grahak/shops");

    } catch (err: unknown) {
      if (err instanceof Error) {
        showmessage("error", err.message);
      } else {
        showmessage("error", "something went wrong");
      }
    } finally {
      setloading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', 
      padding: 'clamp(1rem, 5vw, 2rem)', // Fluid outer padding
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        style={{
          background: 'var(--color-paper)',
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '420px',
          padding: 'clamp(1.75rem, 6vw, 2.5rem) clamp(1.5rem, 5vw, 2.25rem) clamp(1.75rem, 5vw, 2.25rem) clamp(1.5rem, 6vw, 2.75rem)',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(1.25rem, 4vw, 1.5rem)' }}>

          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: '#E8E4D9',
            border: '3px solid #A88D5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 #C4B999, 0 8px 16px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Image 
              src="/digiKhata-logo.png" 
              alt="digikhata logo" 
              fill
              style={{ objectFit: 'cover' }}
              priority 
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(22px, 6vw, 26px)', color: 'var(--color-ink)', margin: 0, fontWeight: 400 }}>
              {t('grahakTitle')}
            </h1>
            <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'var(--color-ink)', opacity: 0.7, margin: '6px 0 0', fontFamily: 'var(--font-noto-gujarati)' }}>
              {t('grahakSubtitle')}
            </p>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'repeating-linear-gradient(to right, rgba(35,42,59,0.3) 0, rgba(35,42,59,0.3) 4px, transparent 4px, transparent 8px)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 3vw, 14px)', width: '100%' }}>
            <LedgerField
              label={t('phoneLabel')}
              value={phone}
              onChange={setphone}
              placeholder={t('phonePlaceholder')}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              }
            />

            <div style={{ marginTop: '4px' }}>
              <StampButton
                tone="ink"
                onClick={handlelogin}
                disabled={loading}
                icon={
                  loading ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                      </path>
                    </svg>
                  ) : undefined
                }
              >
                {loading ? t('loggingIn') : t('loginButton')}
              </StampButton>
            </div>

            <button
              onClick={() => navigateto('/')}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', color: 'var(--color-ink)', opacity: 0.6,
                border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px',
                fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              {t('backToHome')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}