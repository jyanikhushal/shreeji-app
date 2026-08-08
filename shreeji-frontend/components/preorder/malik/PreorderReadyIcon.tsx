import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

interface PreorderReadyIconProps {
  count: number;
  onClick: () => void;
}

export default function PreorderReadyIcon({ count, onClick }: PreorderReadyIconProps) {
  const { t } = useTranslation('preorder');

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: 'relative', background: 'transparent', border: '1.5px solid #16a34a',
        borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 13, fontWeight: 600,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      {t('readyIconLabel')}
      {count > 0 && (
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          style={{
            position: 'absolute', top: -6, right: -6, background: '#16a34a', color: '#fff',
            borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}