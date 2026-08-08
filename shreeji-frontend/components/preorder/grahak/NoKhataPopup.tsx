import { motion, AnimatePresence } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';

interface NoKhataPopupProps {
  show: boolean;
  onClose: () => void;
}

export default function NoKhataPopup({ show, onClose }: NoKhataPopupProps) {
  const { t } = useTranslation('preorder');

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              background: '#FFFFFF', borderRadius: 6,
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: 340,
              borderLeft: '6px solid var(--color-rule-red)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h2 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-ink)', fontSize: 18, fontFamily: 'var(--font-rozha, serif)' }}>
              {t('noKhataTitle')}
            </h2>
            <p style={{ color: 'var(--color-ink)', opacity: 0.7, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              {t('noKhataBody')}
            </p>
            <StampButton tone="ink" onClick={onClose}>
              {t('close')}
            </StampButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}