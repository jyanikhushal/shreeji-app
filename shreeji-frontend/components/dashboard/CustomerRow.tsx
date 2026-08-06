import { motion } from "framer-motion";
import { customer } from "@/types/dashboard";
import { formatdaysago } from "@/lib/dashboard/formatters";

interface CustomerRowProps {
  customer: customer;
  now: number | null;
  onOpen: (phone: string) => void;
  onMenuOpen: (customer: customer) => void;
}

export default function CustomerRow({ customer: c, now, onOpen, onMenuOpen }: CustomerRowProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
      onClick={() => onOpen(c.phone)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(10px, 3vw, 14px) clamp(12px, 3vw, 18px)',
        background: 'rgba(255,255,255,0.4)',
        border: '1px solid rgba(35,42,59,0.1)',
        borderRadius: '8px', cursor: 'pointer',
        transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(35,42,59,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
        }}>
          {c.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 'clamp(15px, 3.5vw, 16px)', fontWeight: 600, color: 'var(--color-ink)' }}>{c.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 'clamp(12px, 3vw, 13px)', color: 'var(--color-ink)', opacity: 0.7 }}>{c.phone}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <p style={{ margin: 0, fontSize: 'clamp(15px, 3.5vw, 16px)', fontWeight: 700, color: 'var(--color-rule-red)' }}>
            ₹{(c.currentBalance ?? 0).toLocaleString('en-IN')}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-ink)', opacity: 0.6 }}>
            {now ? formatdaysago(c.lastDepositAt, now) : '—'}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(c);
          }}
          style={{
            background: 'transparent', border: '1px solid rgba(35,42,59,0.2)',
            cursor: 'pointer', padding: '8px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-ink)', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(35,42,59,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}