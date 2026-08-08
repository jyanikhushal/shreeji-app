import { motion } from "framer-motion";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

const statusColor: Record<string, string> = {
  pending: 'var(--color-brass)', in_progress: '#d97706', ready: '#16a34a',
  collected: 'var(--color-ink)', cancelled: 'var(--color-rule-red)',
};

export default function PreorderHistoryCard({ order, onOpen }: { order: Preorder; onOpen: () => void }) {
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(35,42,59,0.04)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
        background: 'rgba(35,42,59,0.02)', border: '1px solid rgba(35,42,59,0.08)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
          {order.guestName || order.guestPhone}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {t('itemCount', { count: order.items.length })}
        </p>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: statusColor[order.status] || 'var(--color-ink)',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {t(`status.${order.status}`)}
      </span>
    </motion.div>
  );
}