import { motion } from 'framer-motion';
import type { Preorder } from '@/types/preorder';
import { useTranslation } from 'react-i18next';

interface PreorderHistoryListProps {
  history: Preorder[];
  loading: boolean;
}

const statusColor: Record<string, string> = {
  pending: 'var(--color-brass)',
  in_progress: '#d97706',
  ready: '#16a34a',
  collected: 'var(--color-ink)',
  cancelled: 'var(--color-rule-red)',
};

export default function PreorderHistoryList({ history, loading }: PreorderHistoryListProps) {
  const { t } = useTranslation('preorder');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: 14 }}>
        {t('loading')}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: 14 }}>
        {t('noPastOrders')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {history.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'rgba(35,42,59,0.02)', border: '1px solid rgba(35,42,59,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: statusColor[order.status] || 'var(--color-ink)',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {t(`status.${order.status}`)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-ink)' }}>
            {order.items.map(i => `${i.item} (${i.quantity})`).join(', ')}
          </p>
        </motion.div>
      ))}
    </div>
  );
}