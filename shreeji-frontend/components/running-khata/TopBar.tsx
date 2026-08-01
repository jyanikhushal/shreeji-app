import { motion } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import { entry } from "@/types/runningKhata";
import { useTranslation } from 'react-i18next';
interface TopBarProps {
  customername: string;
  customerphone: string | null;
  entries: entry[];
  onback: () => void;
  ondeposit: () => void;
}

export default function TopBar({ customername, customerphone, entries, onback, ondeposit }: TopBarProps) {
    const { t } = useTranslation('runningKhata');
  const currenttotal = entries.length > 0 ? entries[entries.length - 1].total : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: '#DCC999',
        borderRadius: '12px',
        padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
        gap: '12px', marginBottom: '1.5rem',
        boxShadow: '0 8px 30px rgba(35,42,59,0.15)',
        borderLeft: '6px solid var(--color-brass)',
        position: 'sticky', top: '1.5rem', zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
        <button
          onClick={onback}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: '4px',
            color: 'var(--color-ink)', opacity: 0.6,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
        }}>
          {customername ? customername.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: 'var(--color-ink)' }}>
            {customername}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 'clamp(11px, 3vw, 13px)', color: 'var(--color-ink)', opacity: 0.7 }}>
            {customerphone}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: 'auto' }}>
        {entries.length > 0 && (
          <div style={{
            background: currenttotal > 0 ? '#fee2e2' : 'rgba(22, 163, 74, 0.1)',
            color: currenttotal > 0 ? 'var(--color-rule-red)' : 'var(--color-ink)',
            borderRadius: '20px', padding: '6px 14px', fontSize: '14px', fontWeight: 700,
            border: `1px solid ${currenttotal > 0 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`
          }}>
            ₹{currenttotal.toLocaleString('en-IN')}
          </div>
        )}
        <StampButton tone="brass" onClick={ondeposit}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('deposit')}
        </StampButton>
      </div>
    </motion.div>
  );
}