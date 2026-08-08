import { motion } from 'framer-motion';
import StampButton from "@/components/ui/StampButton";
import type { PreorderRowState } from "@/hooks/preorder/usePreorderItemRows";
import { useTranslation } from 'react-i18next';

interface PreorderOrderPreviewProps {
  rows: PreorderRowState[];
  sending: boolean;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function PreorderOrderPreview({ rows, sending, onEdit, onConfirm }: PreorderOrderPreviewProps) {
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-paper)', borderRadius: 12, padding: 'clamp(1.25rem, 5vw, 1.75rem)',
        boxShadow: '0 8px 32px rgba(35,42,59,0.15)', borderTop: '4px solid var(--color-brass)',
        width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <h2 style={{ fontFamily: 'var(--font-rozha, serif)', fontSize: 20, color: 'var(--color-ink)', margin: 0, textAlign: 'center', fontWeight: 400 }}>
        {t('reviewOrderTitle')}
      </h2>

      <div style={{ border: '1px solid rgba(35,42,59,0.1)', borderRadius: 6, overflow: 'hidden' }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
            borderBottom: idx < rows.length - 1 ? '1px solid rgba(35,42,59,0.06)' : 'none',
            fontSize: 14, color: 'var(--color-ink)',
          }}>
            <span style={{ fontWeight: 500 }}>{row.item}</span>
            <span style={{ opacity: 0.7 }}>{row.quantity}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <StampButton tone="brass" onClick={onEdit} disabled={sending}>
            {t('editOrderButton')}
          </StampButton>
        </div>
        <div style={{ flex: 1 }}>
          <StampButton tone="ink" onClick={onConfirm} disabled={sending}>
            {sending ? t('sending') : t('confirmSendButton')}
          </StampButton>
        </div>
      </div>
    </motion.div>
  );
}