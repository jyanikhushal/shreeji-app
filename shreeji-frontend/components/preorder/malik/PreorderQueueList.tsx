import { motion, AnimatePresence } from "framer-motion";
import PreorderQueueCard from "./PreorderQueueCard";
import type { Preorder } from "@/types/preorder";
import { useTranslation } from 'react-i18next';

interface PreorderQueueListProps {
  queue: Preorder[];
  loading: boolean;
  onOpenDetail: (preorder: Preorder) => void;
}

export default function PreorderQueueList({ queue, loading, onOpenDetail }: PreorderQueueListProps) {
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        background: 'var(--color-paper)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 5vw, 1.5rem)',
        boxShadow: '0 8px 32px rgba(35,42,59,0.15)',
        borderTop: '4px solid var(--color-brass)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
        <h2 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          {t('queueTitle')}
        </h2>
        <span style={{
          marginLeft: 'auto', background: 'var(--color-brass)', color: 'var(--color-paper)',
          fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
        }}>
          {t('queueCount', { count: queue.length })}
        </span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: '14px' }}>
          {t('loading')}
        </div>
      )}

      {!loading && queue.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: '14px', fontWeight: 500 }}>
          {t('noOrders')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence mode="popLayout">
          {queue.map((preorder) => (
            <PreorderQueueCard
              key={preorder.id}
              preorder={preorder}
              onOpen={() => onOpenDetail(preorder)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}