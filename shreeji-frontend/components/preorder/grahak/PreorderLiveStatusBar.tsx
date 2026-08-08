import { motion, AnimatePresence } from "framer-motion";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

interface PreorderLiveStatusBarProps {
  order: Preorder | null;
  isCollectedTransient: boolean;
}

const statusColor: Record<string, string> = {
  pending: 'var(--color-brass)', in_progress: '#d97706', ready: '#16a34a', collected: 'var(--color-ink)',
};

export default function PreorderLiveStatusBar({ order, isCollectedTransient }: PreorderLiveStatusBarProps) {
  const { t } = useTranslation('preorder');

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          key={order.id}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
            display: 'flex', justifyContent: 'center', padding: '0 12px 12px',
          }}
        >
          <div style={{
            background: 'var(--color-paper)', borderRadius: 12, padding: '12px 18px',
            boxShadow: '0 -8px 24px rgba(35,42,59,0.2)',
            borderTop: `4px solid ${statusColor[isCollectedTransient ? 'collected' : order.status] || 'var(--color-brass)'}`,
            width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>
                {t('orderNumberLabel', { no: order.orderNumber ?? '—' })}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-ink)', opacity: 0.6 }}>
                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {t('itemCount', { count: order.items.length })}
              </p>
            </div>
            <motion.span
              animate={!isCollectedTransient && order.status === 'ready' ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{
                fontSize: 11, fontWeight: 700,
                color: statusColor[isCollectedTransient ? 'collected' : order.status] || 'var(--color-ink)',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}
            >
              {t(`status.${isCollectedTransient ? 'collected' : order.status}`)}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}