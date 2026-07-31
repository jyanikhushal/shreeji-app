import { motion } from "framer-motion";
import StampButton from "@/components/ui/StampButton";

interface TopBarProps {
  phone: string | null;
  lastTotal: number;
  hasEntries: boolean;
  localGranted: boolean;
  onOpenHistory: () => void;
  onLogout: () => void;
}

export default function TopBar({ phone, lastTotal, hasEntries, localGranted, onOpenHistory, onLogout }: TopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      style={{
        flexShrink: 0,
        background: 'var(--color-paper)', borderRadius: 4,
        borderLeft: '6px solid var(--color-brass)',
        padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 3vw, 1.25rem)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: 12, marginBottom: '1.25rem',
        boxShadow: '0 8px 24px rgba(35,42,59,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: 'var(--color-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
        }}>
          {(phone || '?').charAt(0)}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 17px)', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-rozha, serif)' }}>My Khata</p>
          <p style={{ margin: '2px 0 0', fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--color-ink)', opacity: 0.6 }}>{phone}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 'auto' }}>
        {hasEntries && (
          <div style={{
            background: 'transparent',
            border: `1.5px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
            color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
            borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700,
          }}>
            ₹{lastTotal}
          </div>
        )}

        <StampButton tone="brass" onClick={onOpenHistory} disabled={!localGranted}>
          <motion.div
            animate={{ rotate: [0, 18, -18, 12, -12, 6, -6, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
            style={{ display: 'inline-block', fontSize: 30, transformOrigin: 'top center', lineHeight: 1 }}
          >
            🔔
          </motion.div>
        </StampButton>

        <StampButton tone="ink" onClick={onLogout}>
          Logout
        </StampButton>
      </div>
    </motion.div>
  );
}