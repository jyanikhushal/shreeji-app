interface PreorderItemRowProps {
  variant: 'draft' | 'locked' | 'editing';
  itemValue: string;
  quantityValue: string;
  onItemChange: (v: string) => void;
  onQuantityChange: (v: string) => void;
  onConfirm: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  confirmEnabled: boolean;
}

export default function PreorderItemRow({
  variant, itemValue, quantityValue, onItemChange, onQuantityChange,
  onConfirm, onEdit, onDelete, confirmEnabled,
}: PreorderItemRowProps) {
  const isLocked = variant === 'locked';

  return (
    <tr style={{
      background: variant === 'editing' ? 'rgba(168, 141, 90, 0.15)' : variant === 'draft' ? 'rgba(35,42,59,0.02)' : 'transparent',
      borderBottom: '1px solid rgba(35,42,59,0.08)',
      transition: 'background 0.2s ease',
    }}>
      <td style={{ padding: '8px', overflow: 'hidden' }}>
        {isLocked ? (
          <div style={{ padding: '8px', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500 }}>
            {itemValue}
          </div>
        ) : (
          <input
            value={itemValue}
            onChange={(e) => onItemChange(e.target.value)}
            placeholder={variant === 'draft' ? 'Item name' : ''}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500,
              padding: '8px', borderRadius: '6px', fontFamily: 'inherit',
            }}
          />
        )}
      </td>

      <td style={{ padding: '8px', overflow: 'hidden' }}>
        {isLocked ? (
          <div style={{ padding: '8px', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500, textAlign: 'right' }}>
            {quantityValue}
          </div>
        ) : (
          <input
            value={quantityValue}
            onChange={(e) => onQuantityChange(e.target.value)}
            placeholder={variant === 'draft' ? 'Qty' : ''}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '14px', textAlign: 'right', color: 'var(--color-ink)', fontWeight: 500,
              padding: '8px', borderRadius: '6px', fontFamily: 'inherit',
            }}
          />
        )}
      </td>

      <td style={{ padding: '8px', width: 72, textAlign: 'center' }}>
        {isLocked ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={onEdit}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              aria-label="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={onDelete}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              aria-label="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-rule-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onConfirm}
            disabled={!confirmEnabled}
            style={{
              background: 'transparent', border: 'none',
              cursor: confirmEnabled ? 'pointer' : 'default',
              opacity: confirmEnabled ? 1 : 0.3,
              padding: 4, display: 'flex', margin: '0 auto',
            }}
            aria-label="Confirm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}