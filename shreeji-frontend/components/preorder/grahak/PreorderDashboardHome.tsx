import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PreorderDashboardHomeProps {
  guestName: string | null;
  onPlaceOrder: () => void;
  onViewHistory: () => void;
}

export default function PreorderDashboardHome({ guestName, onPlaceOrder, onViewHistory }: PreorderDashboardHomeProps) {
  const { t } = useTranslation('preorder');

  const cardBase = {
    background: 'var(--color-paper)', borderRadius: 12, padding: '20px',
    boxShadow: '0 8px 24px rgba(35,42,59,0.12)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(35,42,59,0.06)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <h1 style={{
        fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(20px, 6vw, 24px)',
        color: 'var(--color-ink)', margin: '0 0 4px', fontWeight: 400, textAlign: 'center',
      }}>
        {t('welcomeGreeting', { name: guestName || '' })}
      </h1>

      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(35,42,59,0.18)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlaceOrder}
        style={{ ...cardBase, borderLeft: '5px solid #16a34a' }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'rgba(22,163,74,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{t('placeNewOrderCard')}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>{t('placeNewOrderCardSub')}</p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(35,42,59,0.18)' }}
        whileTap={{ scale: 0.98 }}
        style={{ ...cardBase, borderLeft: '5px solid var(--color-brass)', opacity: 0.6, cursor: 'not-allowed' }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'rgba(168,141,90,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{t('uploadPhotoCard')}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>{t('comingSoon')}</p>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(35,42,59,0.18)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewHistory}
        style={{ ...cardBase, borderLeft: '5px solid var(--color-ink)' }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'rgba(35,42,59,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-ink)' }}>{t('viewPastOrdersCard')}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>{t('viewPastOrdersCardSub')}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}