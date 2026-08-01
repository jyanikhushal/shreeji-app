import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
interface StatusBannerProps {
  loading: boolean;
  error: string;
}

export default function StatusBanner({ loading, error }: StatusBannerProps) {
    const { t } = useTranslation('runningKhata');
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{
            background: 'var(--color-paper)', color: 'var(--color-ink)',
            borderRadius: '8px', padding: '8px 16px',
            textAlign: 'center', fontSize: '14px', fontWeight: 600,
            marginBottom: '12px', borderLeft: '4px solid var(--color-brass)',
            boxShadow: '0 4px 12px rgba(35,42,59,0.1)'
          }}
        >
          ⏳ {t('processing')}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{
            background: '#fee2e2', color: 'var(--color-rule-red)',
            borderRadius: '8px', padding: '8px 16px',
            textAlign: 'center', fontSize: '14px', fontWeight: 600,
            marginBottom: '12px', borderLeft: '4px solid var(--color-rule-red)',
            boxShadow: '0 4px 12px rgba(35,42,59,0.1)'
          }}
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}