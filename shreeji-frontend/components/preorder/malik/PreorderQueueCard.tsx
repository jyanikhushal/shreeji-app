import { motion } from "framer-motion";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

interface PreorderQueueCardProps {
  preorder: Preorder;
  onOpen: () => void;
}

const statusColor: Record<string, string> = {
  pending: 'var(--color-brass)', in_progress: '#d97706', ready: '#16a34a',
};

export default function PreorderQueueCard({ preorder, onOpen }: PreorderQueueCardProps) {
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.015, boxShadow: '0 8px 20px rgba(35,42,59,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
        background: 'rgba(35,42,59,0.02)', border: '1px solid rgba(35,42,59,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {preorder.status === 'ready' && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}
          />
        )}
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            {preorder.guestName || preorder.guestPhone}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-ink)', opacity: 0.6 }}>
            {preorder.guestPhone} · {t('itemCount', { count: preorder.items.length })}
          </p>
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, color: statusColor[preorder.status] || 'var(--color-ink)',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {t(`status.${preorder.status}`)}
      </span>
    </motion.div>
  );
}