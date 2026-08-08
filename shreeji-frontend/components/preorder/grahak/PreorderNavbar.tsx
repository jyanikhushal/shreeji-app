import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PreorderNavbarProps {
  shopName: string;
  guestName: string | null;
  onBack?: () => void;
}

export default function PreorderNavbar({ shopName, guestName, onBack }: PreorderNavbarProps) {
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-paper)', borderRadius: 12,
        padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(35,42,59,0.15)', borderLeft: '6px solid var(--color-rule-red)',
        width: '100%', marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{
              background: 'transparent', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: 6,
              padding: 6, cursor: 'pointer', display: 'flex',
            }}
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </motion.button>
        )}
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{shopName}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>
            {t('orderingAs', { name: guestName || '' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}