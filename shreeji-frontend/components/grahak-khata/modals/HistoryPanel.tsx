import { motion, AnimatePresence } from "framer-motion";
import StampButton from "@/components/ui/StampButton";
import { NotificationItem } from "@/types/grahakKhata";

interface HistoryPanelProps {
  show: boolean;
  history: NotificationItem[];
  historyLoading: boolean;
  onClose: () => void;
}

export default function HistoryPanel({ show, history, historyLoading, onClose }: HistoryPanelProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(35,42,59,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-paper)', borderRadius: 6, padding: 20,
              width: 'calc(100% - 2rem)', maxWidth: 360,
              borderLeft: '6px solid var(--color-brass)',
              maxHeight: '70vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
            }}
          >
            <h2 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--color-ink)', fontSize: 17, fontFamily: 'var(--font-rozha, serif)' }}>
              Notifications
            </h2>
            {historyLoading ? (
              <p style={{ color: 'var(--color-ink)', opacity: 0.5, fontSize: 14, textAlign: 'center' }}>Loading...</p>
            ) : history.length === 0 ? (
              <p style={{ color: 'var(--color-ink)', opacity: 0.5, fontSize: 14, textAlign: 'center' }}>No notifications yet</p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px dashed rgba(35,42,59,0.2)' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{item.title}</p>
                  <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--color-ink)', opacity: 0.75 }}>{item.body}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--color-ink)', opacity: 0.5 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            <div style={{ marginTop: 14 }}>
              <StampButton tone="brass" onClick={onClose}>
                Close
              </StampButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}