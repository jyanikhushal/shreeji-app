import { Entry } from "@/types/grahakKhata";
import { useTranslation } from 'react-i18next';
interface SummaryCardsProps {
  entries: Entry[];
}

export default function SummaryCards({ entries }: SummaryCardsProps) {
    const { t } = useTranslation('grahakKhata');
  if (entries.length === 0) return null;

  const cards = [
    { label: t('entries'), value: entries.length, color: 'var(--color-ink)' },
    {
      label: t('purchased'),
      value: `₹${entries.filter(e => !(e.description || '').startsWith('Deposit')).reduce((s, e) => s + Math.abs(e.amount), 0)}`,
      color: 'var(--color-rule-red)',
    },
    {
      label: t('deposited'),
      value: `₹${entries.filter(e => (e.description || '').startsWith('Deposit')).reduce((s, e) => s + Math.abs(e.amount), 0)}`,
      color: 'var(--color-stamp-green)',
    },
  ];
  
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: 12, marginBottom: '1.25rem', flexShrink: 0
    }}>
      {cards.map((card) => (
        <div key={card.label} style={{
          background: 'var(--color-paper)', borderRadius: 6,
          borderTop: '3px solid var(--color-brass)',
          padding: 'clamp(0.75rem, 3vw, 1rem)', textAlign: 'center',
          boxShadow: '0 4px 12px rgba(35,42,59,0.1)',
        }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--color-ink)', opacity: 0.6, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 4 }}>
            {card.label}
          </p>
          <p style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 21px)', fontWeight: 700, color: card.color, fontFamily: 'var(--font-rozha, serif)' }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}