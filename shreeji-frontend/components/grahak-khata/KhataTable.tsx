import { Entry } from "@/types/grahakKhata";

interface KhataTableProps {
  entries: Entry[];
  lastTotal: number;
  setLastRowRef: (el: HTMLTableRowElement | null) => void;
}

const HEADERS = ['#', 'Date', 'Item', 'Amount', 'Total'];

export default function KhataTable({ entries, lastTotal, setLastRowRef }: KhataTableProps) {
  return (
    <div style={{
      flex: 1, overflow: 'auto', minHeight: 0,
      background: 'var(--color-paper)', borderRadius: 6,
      boxShadow: '0 8px 24px rgba(35,42,59,0.12)'
    }}>
      {entries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-ink)', opacity: 0.5, fontSize: 15 }}>
          No entries found
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h} style={{
                  position: 'sticky', top: 0, zIndex: 50,
                  background: '#DED0AC',
                  padding: '12px clamp(6px, 2vw, 10px)', color: 'var(--color-ink)', fontWeight: 600, fontSize: 13,
                  borderBottom: '2px solid var(--color-brass)',
                  textAlign: h === 'Amount' || h === 'Total' ? 'right' : 'center',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, index) => {
              const isDeposit = (e.description || '').startsWith('Deposit');
              const isLast = index === entries.length - 1;
              return (
                <tr
                  key={e.entryNo}
                  ref={isLast ? setLastRowRef : null}
                  style={{
                    background: isDeposit ? 'rgba(47,107,79,0.07)' : isLast ? 'rgba(184,135,59,0.07)' : 'transparent',
                    borderBottom: '1px solid rgba(35,42,59,0.08)',
                  }}
                >
                  <td style={{ padding: '10px clamp(4px, 2vw, 10px)', textAlign: 'center', fontSize: 13, fontWeight: 600, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-brass)' }}>
                    {e.entryNo}
                  </td>
                  <td style={{ padding: '10px clamp(4px, 2vw, 10px)', textAlign: 'center', fontSize: 12, color: 'var(--color-ink)', opacity: 0.55, whiteSpace: 'nowrap' }}>
                    {e.date}
                  </td>
                  <td style={{ padding: '10px clamp(4px, 2vw, 10px)', fontSize: 14, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-ink)', fontWeight: isDeposit ? 600 : 400 }}>
                    {e.description || ''}
                  </td>
                  <td style={{ padding: '10px clamp(6px, 2vw, 14px)', textAlign: 'right', fontSize: 14, fontWeight: 500, color: isDeposit ? 'var(--color-stamp-green)' : 'var(--color-rule-red)' }}>
                    {isDeposit ? '-' : '+'}₹{Math.abs(e.amount)}
                  </td>
                  <td style={{
                    padding: '10px clamp(6px, 2vw, 14px)', textAlign: 'right', fontWeight: 700, fontSize: 14,
                    color: e.total > 0 ? 'var(--color-rule-red)' : e.total < 0 ? 'var(--color-stamp-green)' : 'var(--color-ink)',
                  }}>
                    ₹{e.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: lastTotal > 0 ? 'rgba(180,67,63,0.1)' : 'rgba(47,107,79,0.1)' }}>
              <td colSpan={4} style={{
                padding: '13px clamp(8px, 2vw, 14px)', textAlign: 'right', fontWeight: 700, fontSize: 14,
                color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
                borderTop: `2px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
              }}>
                {lastTotal > 0 ? 'Amount Due' : 'Credit Balance'}
              </td>
              <td style={{
                padding: '13px clamp(8px, 2vw, 14px)', textAlign: 'right', fontWeight: 800, fontSize: 16,
                color: lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)',
                borderTop: `2px solid ${lastTotal > 0 ? 'var(--color-rule-red)' : 'var(--color-stamp-green)'}`,
              }}>
                ₹{Math.abs(lastTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}