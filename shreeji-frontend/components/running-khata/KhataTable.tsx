import { motion, AnimatePresence } from "framer-motion";
import EntryRow from "./EntryRow";
import { entry } from "@/types/runningKhata";
import { useTranslation } from 'react-i18next';
interface KhataTableProps {
  entries: entry[];
  editingrow: number | null;
  issubmitting: boolean;
  setrowref: (el: HTMLTableRowElement | null) => void;
  setitemref: (index: number) => (el: HTMLInputElement | null) => void;
  setamountref: (index: number) => (el: HTMLInputElement | null) => void;
  onitemchange: (index: number, value: string) => void;
  onamountchange: (index: number, value: string) => void;
  onitementer: (index: number) => void;
  onamountenter: (index: number, value: string) => void;
  onamountblur: (index: number, value: string) => void;
  onrownumberclick: (index: number) => void;
}



export default function KhataTable({
  entries, editingrow, issubmitting,
  setrowref, setitemref, setamountref,
  onitemchange, onamountchange, onitementer, onamountenter, onamountblur, onrownumberclick,
}: KhataTableProps) {
    const { t } = useTranslation('runningKhata');
    const headers = [
    t('tableHeaders.no'),
    t('tableHeaders.date'),
    t('tableHeaders.item'),
    t('tableHeaders.amount'),
    t('tableHeaders.total'),
  ];
  const firstawaitingindex = entries.findIndex(r => r.awaitingResubmit);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        background: 'var(--color-paper)', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(35,42,59,0.15)', overflowX: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed', boxSizing: 'border-box' }}>
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: 'rgba(168, 141, 90, 0.1)' }}>
            {headers.map((h, i) => (
              <th key={h} style={{
                padding: '14px clamp(8px, 2vw, 12px)',
                color: 'var(--color-ink)', fontWeight: 700, fontSize: '13px',
                borderBottom: '2px solid rgba(168, 141, 90, 0.2)',
                textAlign: i === 3 || i === 4 ? 'right' : 'center',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {entries.map((row, index) => {
              const islastrow = index === entries.length - 1;
              const isearliestawaitingresubmit = !!(row.awaitingResubmit && firstawaitingindex === index);

              return (
                <EntryRow
                  key={row.entryNo}
                  row={row}
                  index={index}
                  islastrow={islastrow}
                  isearliestawaitingresubmit={isearliestawaitingresubmit}
                  editingrow={editingrow}
                  issubmitting={issubmitting}
                  setrowref={islastrow ? setrowref : () => {}}
                  setitemref={setitemref(index)}
                  setamountref={setamountref(index)}
                  onitemchange={onitemchange}
                  onamountchange={onamountchange}
                  onitementer={onitementer}
                  onamountenter={onamountenter}
                  onamountblur={onamountblur}
                  onrownumberclick={onrownumberclick}
                />
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
}