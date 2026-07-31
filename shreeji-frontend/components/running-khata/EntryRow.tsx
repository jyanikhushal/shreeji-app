import { motion } from "framer-motion";
import { useToast } from "@/app/context/ToastContext";
import MarqueeText from "@/components/ui/MarqueeText";
import { entry } from "@/types/runningKhata";

interface EntryRowProps {
  row: entry;
  index: number;
  islastrow: boolean;
  isearliestawaitingresubmit: boolean;
  editingrow: number | null;
  issubmitting: boolean;
  setrowref: (el: HTMLTableRowElement | null) => void;
  setitemref: (el: HTMLInputElement | null) => void;
  setamountref: (el: HTMLInputElement | null) => void;
  onitemchange: (index: number, value: string) => void;
  onamountchange: (index: number, value: string) => void;
  onitementer: (index: number) => void;
  onamountenter: (index: number, value: string) => void;
  onamountblur: (index: number, value: string) => void;
  onrownumberclick: (index: number) => void;
}

export default function EntryRow({
  row, index, islastrow, isearliestawaitingresubmit, editingrow, issubmitting,
  setrowref, setitemref, setamountref,
  onitemchange, onamountchange, onitementer, onamountenter, onamountblur, onrownumberclick,
}: EntryRowProps) {
  const { showMessage: showmessage } = useToast();

  const isediting = editingrow === index;
  const isdeposit = (row.item || '').startsWith('Deposit');
  const isdimmed = editingrow !== null && !isediting;
  const iseditablenow = editingrow === index || (editingrow === null && islastrow) || isearliestawaitingresubmit;
  const iteminputdisabled = issubmitting || !iseditablenow || isdeposit;

  return (
    <motion.tr
      ref={islastrow ? setrowref : null}
      layout
      initial={islastrow ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: isdimmed ? 0.4 : 1, y: 0 }}
      style={{
        background: isediting ? 'rgba(168, 141, 90, 0.15)' : isdeposit ? 'rgba(22, 163, 74, 0.05)' : islastrow ? 'rgba(35,42,59,0.02)' : 'transparent',
        borderBottom: '1px solid rgba(35,42,59,0.08)',
        transition: 'background 0.2s ease',
      }}
    >
      <td
        onClick={() => {
          if (editingrow !== null) return;
          if (islastrow) return;
          if (row.pending || row.awaitingResubmit) {
            showmessage("info", "Still confirming — try again in a moment");
            return;
          }
          onrownumberclick(index);
        }}
        style={{
          padding: '12px clamp(6px, 2vw, 10px)', textAlign: 'center',
          cursor: (islastrow || row.pending || row.awaitingResubmit) ? 'default' : 'pointer',
          color: (islastrow || row.pending || row.awaitingResubmit) ? 'rgba(35,42,59,0.3)' : 'var(--color-brass)',
          fontWeight: 700, fontSize: '13px', userSelect: 'none',
        }}
      >
        {row.entryNo}
      </td>

      <td style={{ padding: '12px clamp(6px, 2vw, 10px)', textAlign: 'center', fontSize: '13px', color: 'var(--color-ink)', opacity: 0.7, whiteSpace: 'nowrap' }}>
        {row.date}
      </td>

      <td style={{ padding: '8px', overflow: 'hidden' }}>
        {!iteminputdisabled ? (
          <input
            ref={setitemref}
            value={row.item}
            onChange={(e) => onitemchange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onitementer(index);
              }
            }}
            placeholder={islastrow ? 'Type item...' : ''}
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', fontSize: '14px',
              color: 'var(--color-ink)', fontWeight: 500,
              padding: '8px', borderRadius: '6px', fontFamily: 'inherit'
            }}
          />
        ) : (
          <div style={{
            padding: '8px', fontSize: '14px',
            color: isdeposit ? '#16a34a' : 'var(--color-ink)',
            fontWeight: isdeposit ? 700 : 500,
          }}>
            <MarqueeText text={row.item} />
          </div>
        )}
      </td>

      <td style={{ padding: '8px', position: 'relative' }}>
        <input
          ref={setamountref}
          value={row.amount}
          disabled={issubmitting || (editingrow !== index && !(editingrow === null && islastrow) && !isearliestawaitingresubmit)}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d{0,2}$/.test(value)) {
              onamountchange(index, value);
            }
          }}
          onBlur={(e) => {
            if (isediting) onamountblur(index, e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onamountenter(index, e.currentTarget.value);
            }
          }}
          placeholder={islastrow ? '0' : ''}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', fontSize: '15px', textAlign: 'right',
            color: isdeposit ? '#16a34a' : 'var(--color-ink)',
            fontWeight: isdeposit ? 700 : 500,
            padding: '8px', borderRadius: '6px', fontFamily: 'inherit',
            position: 'relative', zIndex: 1
          }}
        />
        {(row.pending || row.awaitingResubmit) && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            style={{
              position: 'absolute', top: '12px', right: '8px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#dc2626', boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)',
              zIndex: 10, pointerEvents: 'none'
            }}
          />
        )}
      </td>

      <td style={{
        padding: '12px clamp(8px, 2vw, 14px)', textAlign: 'right',
        fontWeight: 700, fontSize: '15px',
        color: row.total > 0 ? 'var(--color-rule-red)' : row.total < 0 ? '#16a34a' : 'var(--color-ink)',
        whiteSpace: 'nowrap', opacity: (row.total === 0 && islastrow) ? 0.4 : 1
      }}>
        {row.awaitingResubmit ? '' : (row.total !== 0 || !islastrow ? `₹${row.total.toLocaleString('en-IN')}` : '₹0')}
      </td>
    </motion.tr>
  );
}