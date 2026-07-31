import { motion, AnimatePresence } from "framer-motion";

interface RowOptionsModalProps {
  show: boolean;
  customerName?: string;
  onEditName: () => void;
  onEditPhone: () => void;
  onCancel: () => void;
}

export default function RowOptionsModal({ show, customerName, onEditName, onEditPhone, onCancel }: RowOptionsModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: 'var(--color-paper)', borderRadius: '12px',
              padding: 'clamp(1.5rem, 5vw, 2rem)',
              width: 'calc(100% - 2rem)', maxWidth: '340px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '18px' }}>Options</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '20px' }}>{customerName}</p>

            <button
              onClick={onEditName}
              style={{ width: '100%', marginBottom: '10px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Name
            </button>

            <button
              onClick={onEditPhone}
              style={{ width: '100%', marginBottom: '16px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Edit Phone Number
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