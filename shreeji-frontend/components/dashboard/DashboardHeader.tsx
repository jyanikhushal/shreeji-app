import Image from "next/image";
import { motion } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import { malik } from "@/types/dashboard";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface DashboardHeaderProps {
  malikdata: malik;
  onLogout: () => void;
  onAddCustomer: () => void;
  onOpenPreorders: () => void;
}

export default function DashboardHeader({ malikdata, onLogout, onAddCustomer, onOpenPreorders }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard');
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: 'var(--color-paper)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 30px rgba(35,42,59,0.15)',
        borderLeft: '6px solid var(--color-rule-red)',
        position: 'sticky',
        top: '1rem',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#E8E4D9', border: '2px solid #A88D5A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative', flexShrink: 0
        }}>
          <Image
            src="/digiKhata-logo.png"
            alt="digikhata logo"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div>
          <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
            {malikdata?.shopName || t('myShop')}
          </p>
          <p style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: 'var(--color-ink)', opacity: 0.7, margin: '3px 0 0' }}>
            {malikdata?.name} &nbsp;·&nbsp; {malikdata?.phone}
          </p>
        </div>
      </div>

      <div style={{ flex: '1 1 100%', order: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
        <p style={{
          fontFamily: 'var(--font-noto-gujarati)',
          fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700, color: 'var(--color-brass)',
          margin: 0, letterSpacing: '0.5px', textAlign: 'center',
        }}>
          જય શ્રી સ્વામિનારાયણ
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
        <LanguageSwitcher userType="malik" phone={malikdata?.phone} />
        <button
          onClick={onOpenPreorders}
          style={{
            padding: '8px 14px', background: 'transparent', color: 'var(--color-brass)',
            border: '1.5px solid var(--color-brass)', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          {t('preordersButton')}
        </button>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 14px', background: 'transparent', color: 'var(--color-rule-red)',
            border: '1.5px solid var(--color-rule-red)', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-rule-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t('logout')}
        </button>
        <StampButton tone="brass" onClick={onAddCustomer}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('newCustomer')}
        </StampButton>
      </div>
    </motion.div>
  );
}