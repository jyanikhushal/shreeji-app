import { motion, AnimatePresence } from "framer-motion";

interface RowOptionsModalProps {
  show: boolean;
  entryNo?: number;
  onEditRow: () => void;
  onDeleteRow: () => void;
  onCancel: () => void;
}

export default function RowOptionsModal({ show, entryNo, onEditRow, onDeleteRow, onCancel }: RowOptionsModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--color-paper)', borderRadius: '12px',
              padding: 'clamp(1.5rem, 5vw, 2rem)', width: 'calc(100% - 2rem)', maxWidth: '320px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)', borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '18px' }}>Row Options</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '20px' }}>Entry #{entryNo ?? ''}</p>

            <button
              onClick={onEditRow}
              style={{ width: '100%', marginBottom: '10px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Row
            </button>

            <button
              onClick={onDeleteRow}
              style={{ width: '100%', marginBottom: '16px', padding: '12px 0', border: '1.5px solid var(--color-rule-red)', borderRadius: '6px', background: 'rgba(220, 38, 38, 0.05)', color: 'var(--color-rule-red)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Delete Row
            </button>

            <button
              onClick={onCancel}
              style={{ width: '100%', padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}