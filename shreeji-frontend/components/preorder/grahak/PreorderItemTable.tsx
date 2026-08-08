import { motion } from 'framer-motion';
import PreorderItemRow from './PreorderItemRow';
import { usePreorderItemRows } from '@/hooks/preorder/usePreorderItemRows';
import { useTranslation } from 'react-i18next';

interface PreorderItemTableProps {
  rowsHook: ReturnType<typeof usePreorderItemRows>;
}

export default function PreorderItemTable({ rowsHook }: PreorderItemTableProps) {
  const { t } = useTranslation('preorder');
  const {
    rows, draftItem, draftQuantity, draftReady, editingRowId, editBuffer,
    setDraftItem, setDraftQuantity, confirmDraft,
    startEdit, updateEditBuffer, confirmEdit, deleteRow,
  } = rowsHook;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--color-paper)', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(35,42,59,0.15)', overflowX: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed', boxSizing: 'border-box' }}>
        <colgroup>
          <col style={{ width: '45%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: 'rgba(168, 141, 90, 0.1)' }}>
            <th style={{ padding: '14px 12px', color: 'var(--color-ink)', fontWeight: 700, fontSize: '13px', borderBottom: '2px solid rgba(168, 141, 90, 0.2)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('itemColumn')}
            </th>
            <th style={{ padding: '14px 12px', color: 'var(--color-ink)', fontWeight: 700, fontSize: '13px', borderBottom: '2px solid rgba(168, 141, 90, 0.2)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('quantityColumn')}
            </th>
            <th style={{ padding: '14px 12px', borderBottom: '2px solid rgba(168, 141, 90, 0.2)' }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isEditingThis = editingRowId === row.id;
            return (
              <PreorderItemRow
                key={row.id}
                variant={isEditingThis ? 'editing' : 'locked'}
                itemValue={isEditingThis ? editBuffer.item : row.item}
                quantityValue={isEditingThis ? editBuffer.quantity : row.quantity}
                onItemChange={(v) => updateEditBuffer('item', v)}
                onQuantityChange={(v) => updateEditBuffer('quantity', v)}
                onConfirm={confirmEdit}
                onEdit={() => startEdit(row.id)}
                onDelete={() => deleteRow(row.id)}
                confirmEnabled={editBuffer.item.trim().length > 0 && editBuffer.quantity.trim().length > 0}
              />
            );
          })}

          <PreorderItemRow
            variant="draft"
            itemValue={draftItem}
            quantityValue={draftQuantity}
            onItemChange={setDraftItem}
            onQuantityChange={setDraftQuantity}
            onConfirm={confirmDraft}
            confirmEnabled={draftReady}
          />
        </tbody>
      </table>
    </motion.div>
  );
}