import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

interface PreorderDetailModalProps {
  show: boolean;
  preorder: Preorder | null;
  khataMatchName: string | null;
  actionLoading: boolean;
  onClose: () => void;
  onStartPreparing: () => void;
  onMarkReady: () => void;
  onSaveDestination: (savedAs: "normal" | "khata", customerTypedName: string) => void;
}

export default function PreorderDetailModal({
  show, preorder, khataMatchName, actionLoading,
  onClose, onStartPreparing, onMarkReady, onSaveDestination,
}: PreorderDetailModalProps) {
  const { t } = useTranslation('preorder');
  const [typedName, setTypedName] = useState('');

  if (!preorder) return null;

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
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--color-paper)', borderRadius: 8,
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: 420,
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-ink)', fontSize: 18 }}>
              {preorder.guestPhone}
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t(`status.${preorder.status}`)}
            </p>

            <div style={{
              border: '1px solid rgba(35,42,59,0.1)', borderRadius: 6, marginBottom: 20, overflow: 'hidden',
            }}>
              {preorder.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                  borderBottom: idx < preorder.items.length - 1 ? '1px solid rgba(35,42,59,0.06)' : 'none',
                  fontSize: 14, color: 'var(--color-ink)',
                }}>
                  <span style={{ fontWeight: 500 }}>{item.item}</span>
                  <span style={{ opacity: 0.7 }}>{item.quantity}</span>
                </div>
              ))}
            </div>

            {(preorder.status === "pending" || preorder.status === "in_progress") && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preorder.status === "pending" && (
                  <StampButton tone="ink" onClick={onStartPreparing} disabled={actionLoading}>
                    {actionLoading ? t('updating') : t('startPreparingButton')}
                  </StampButton>
                )}
                <StampButton tone="brass" onClick={onMarkReady} disabled={actionLoading}>
                  {actionLoading ? t('updating') : t('markReadyButton')}
                </StampButton>
              </div>
            )}

            {preorder.status === "ready" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {khataMatchName && (
                  <p style={{
                    fontSize: 13, color: 'var(--color-ink)', background: 'rgba(168, 141, 90, 0.1)',
                    padding: '10px 12px', borderRadius: 6, margin: 0,
                  }}>
                    {t('khataMatchHint', { name: khataMatchName })}
                  </p>
                )}

                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={t('customerNamePlaceholder')}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 14,
                    border: '1px solid rgba(35,42,59,0.2)', borderRadius: 6,
                    outline: 'none', fontFamily: 'inherit', color: 'var(--color-ink)',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <StampButton
                      tone="brass"
                      onClick={() => onSaveDestination("normal", typedName)}
                      disabled={actionLoading}
                    >
                      {t('saveAsNormalButton')}
                    </StampButton>
                  </div>
                  <div style={{ flex: 1 }}>
                    <StampButton
                      tone="ink"
                      onClick={() => onSaveDestination("khata", typedName)}
                      disabled={actionLoading || !typedName.trim()}
                    >
                      {t('saveAsKhataButton')}
                    </StampButton>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%', marginTop: 16, padding: '10px 0',
                border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px',
                background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              {t('close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}