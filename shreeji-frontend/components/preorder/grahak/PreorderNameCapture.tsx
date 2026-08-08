import { useState } from 'react';
import { motion } from 'framer-motion';
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';

interface PreorderNameCaptureProps {
  saving: boolean;
  onSubmit: (name: string) => void;
}

export default function PreorderNameCapture({ saving, onSubmit }: PreorderNameCaptureProps) {
  const [name, setName] = useState('');
  const { t } = useTranslation('preorder');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--color-paper)',
        borderRadius: 4,
        borderLeft: '6px solid var(--color-rule-red)',
        padding: 'clamp(1.75rem, 6vw, 2.5rem)',
        boxShadow: '0 20px 50px rgba(35,42,59,0.25)',
        maxWidth: 420, width: '100%',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
    >
      <h1 style={{
        fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(20px, 6vw, 24px)',
        color: 'var(--color-ink)', textAlign: 'center', margin: 0, fontWeight: 400,
      }}>
        {t('nameCaptureTitle')}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-ink)', opacity: 0.7, textAlign: 'center', margin: 0 }}>
        {t('nameCaptureSubtitle')}
      </p>

                  <LedgerField
              label={t('nameLabel')}
              value={name}
              onChange={setName}
              placeholder={t('namePlaceholder')}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            />

      <StampButton tone="ink" onClick={() => onSubmit(name)} disabled={saving || !name.trim()}>
        {saving ? t('saving') : t('continueButton')}
      </StampButton>
    </motion.div>
  );
}