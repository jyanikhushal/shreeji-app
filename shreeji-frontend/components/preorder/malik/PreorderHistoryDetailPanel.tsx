import { motion, AnimatePresence } from "framer-motion";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

export default function PreorderHistoryDetailPanel({ order, onClose }: { order: Preorder | null; onClose: () => void }) {
  const { t } = useTranslation('preorder');

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-paper)', borderRadius: 8,
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: 420,
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)', borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-ink)', fontSize: 18 }}>
              {order.guestName || order.guestPhone}
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>
              {order.guestPhone}
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t(`status.${order.status}`)} · {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>

            <div style={{ border: '1px solid rgba(35,42,59,0.1)', borderRadius: 6, marginBottom: 16, overflow: 'hidden' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                  borderBottom: idx < order.items.length - 1 ? '1px solid rgba(35,42,59,0.06)' : 'none',
                  fontSize: 14, color: 'var(--color-ink)',
                }}>
                  <span style={{ fontWeight: 500 }}>{item.item}</span>
                  <span style={{ opacity: 0.7 }}>{item.quantity}</span>
                </div>
              ))}
            </div>

            {order.savedAs && (
              <p style={{ fontSize: 13, color: 'var(--color-ink)', opacity: 0.7, margin: '0 0 16px' }}>
                {t('savedAsLabel', { type: order.savedAs === 'khata' ? t('saveAsKhataButton') : t('saveAsNormalButton') })}
              </p>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '10px 0', border: '1px dashed rgba(35,42,59,0.3)',
                borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
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