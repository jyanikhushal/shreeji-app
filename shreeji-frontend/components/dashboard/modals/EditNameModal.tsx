import { motion, AnimatePresence } from "framer-motion";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';
interface EditNameModalProps {
  show: boolean;
  phone?: string;
  editname: string;
  setEditname: (val: string) => void;
  isediting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function EditNameModal({ show, phone, editname, setEditname, isediting, onCancel, onSubmit }: EditNameModalProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--color-paper)', borderRadius: '12px',
              padding: 'clamp(1.5rem, 5vw, 2rem)',
              width: 'calc(100% - 2rem)', maxWidth: '380px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>{t('dashboard:editNameTitle')}</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>{t('dashboard:editNameSubtitle', { phone })}</p>

            <div style={{ marginBottom: '24px' }}>
              <LedgerField
                label={t('dashboard:customerNameLabel')}
                value={editname}
                onChange={setEditname}
                placeholder={t('dashboard:newNamePlaceholder')}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCancel}
                style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
              >
                {t('common:cancel')}
              </button>
              <div style={{ flex: 1 }}>
                <StampButton tone="ink" onClick={onSubmit}>
                  {isediting ? t('common:saving') : t('common:change')}
                </StampButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}