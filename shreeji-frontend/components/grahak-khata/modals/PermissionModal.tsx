import { motion, AnimatePresence } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';
interface PermissionModalProps {
  show: boolean;
  enabling: boolean;
  onDecline: () => void;
  onEnable: () => void;
}

export default function PermissionModal({ show, enabling, onDecline, onEnable }: PermissionModalProps) {
    const { t } = useTranslation('grahakKhata');
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              background: '#FFFFFF', borderRadius: 6,
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: 340,
              borderLeft: '6px solid var(--color-brass)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <h2 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-ink)', fontSize: 'clamp(17px, 5vw, 19px)', fontFamily: 'var(--font-rozha, serif)' }}>
              {t('enableNotificationsTitle')}
            </h2>
            <p style={{ color: 'var(--color-ink)', opacity: 0.7, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              {t('enableNotificationsBody')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <StampButton tone="brass" onClick={onDecline} disabled={enabling}>
                  {t('notNow')}
                </StampButton>
              </div>
              <div style={{ flex: 1 }}>
                <StampButton tone="ink" onClick={onEnable} disabled={enabling}>
                  {enabling ? t('enabling') : t('yesEnable')}
                </StampButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}