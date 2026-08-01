import { motion, AnimatePresence } from "framer-motion";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';
interface DepositModalProps {
  show: boolean;
  customername: string;
  depositamount: string;
  setDepositamount: (val: string) => void;
  issubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DepositModal({ show, customername, depositamount, setDepositamount, issubmitting, onCancel, onConfirm }: DepositModalProps) {
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
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: '340px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderLeft: '6px solid var(--color-brass)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>{t('addDeposit')}</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>{t('amountReceivedFrom', { name: customername })}</p>

            <div style={{ marginBottom: '24px' }}>
              <LedgerField
                label={t('depositAmountLabel')}
                value={depositamount}
                onChange={(val) => setDepositamount(val)}
                placeholder={t('enterAmount')}
                type="number"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCancel}
                style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
              >
                {t('cancel')}
              </button>
              <div style={{ flex: 1 }}>
                <StampButton
                  tone="brass"
                  onClick={onConfirm}
                  disabled={issubmitting}
                  icon={
                    issubmitting ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                        </path>
                      </svg>
                    ) : undefined
                  }
                >
                  {issubmitting ? t('confirming') : t('confirm')}
                </StampButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}