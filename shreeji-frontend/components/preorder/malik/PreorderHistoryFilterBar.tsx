import { useTranslation } from 'react-i18next';

interface PreorderHistoryFilterBarProps {
  sortOption: "newest" | "oldest";
  setSortOption: (v: "newest" | "oldest") => void;
  groupOption: "none" | "guest";
  setGroupOption: (v: "none" | "guest") => void;
}

export default function PreorderHistoryFilterBar({ sortOption, setSortOption, groupOption, setGroupOption }: PreorderHistoryFilterBarProps) {
  const { t } = useTranslation('preorder');

  const selectStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
    background: 'transparent', border: '1px solid rgba(35,42,59,0.3)',
    borderRadius: 6, padding: '6px 10px', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value as "newest" | "oldest")} style={selectStyle}>
        <option value="newest">{t('sortNewest')}</option>
        <option value="oldest">{t('sortOldest')}</option>
      </select>
      <select value={groupOption} onChange={(e) => setGroupOption(e.target.value as "none" | "guest")} style={selectStyle}>
        <option value="none">{t('groupNone')}</option>
        <option value="guest">{t('groupByGuest')}</option>
      </select>
    </div>
  );
}