import { motion } from 'framer-motion';
import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';

interface PreorderChoiceScreenProps {
  onPlaceOrder: () => void;
  onViewKhata: () => void;
}

export default function PreorderChoiceScreen({ onPlaceOrder, onViewKhata }: PreorderChoiceScreenProps) {
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
        {t('choiceTitle')}
      </h1>

      <StampButton tone="ink" onClick={onPlaceOrder}>
        {t('placeOrderButton')}
      </StampButton>

      <StampButton tone="brass" onClick={onViewKhata}>
        {t('viewKhataButton')}
      </StampButton>
    </motion.div>
  );
}