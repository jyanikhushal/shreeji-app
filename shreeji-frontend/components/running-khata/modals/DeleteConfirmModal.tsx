import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
interface DeleteConfirmModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ show, onCancel, onConfirm }: DeleteConfirmModalProps) {
    const { t } = useTranslation('runningKhata');
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--color-paper)', borderRadius: '12px',
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: '320px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-rule-red)', fontSize: '20px' }}>{t('deleteEntryTitle')}</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>{t('deleteEntryBody')}</p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCancel}
                style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
              >
               {t('cancel')}
              </button>
              <button
                onClick={onConfirm}
                style={{ flex: 1, padding: '12px 0', background: 'var(--color-rule-red)', color: 'var(--color-paper)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}
              >
                {t('delete')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
