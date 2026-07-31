import { motion, AnimatePresence } from "framer-motion";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";

interface AddCustomerModalProps {
  show: boolean;
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function AddCustomerModal({ show, name, setName, phone, setPhone, onCancel, onSubmit }: AddCustomerModalProps) {
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
              width: 'calc(100% - 2rem)', maxWidth: '380px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              borderLeft: '6px solid var(--color-rule-red)',
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>Add Customer</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>Enter the customer details below</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <LedgerField
                label="Customer Name"
                value={name}
                onChange={setName}
                placeholder="Enter customer name"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
              <LedgerField
                label="Phone Number"
                value={phone}
                onChange={(val) => setPhone(val.replace(/\D/g, ""))}
                placeholder="Enter phone number"
                type="text"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onCancel}
                style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
              >
                Cancel
              </button>
              <div style={{ flex: 1 }}>
                <StampButton tone="ink" onClick={onSubmit}>Add</StampButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}