import { motion, AnimatePresence } from "framer-motion";
import LedgerField from "@/components/ui/LedgerField";
import CustomerRow from "./CustomerRow";
import { customer, sortoption } from "@/types/dashboard";
import { useTranslation } from 'react-i18next';
interface CustomerListCardProps {
  customers: customer[];
  now: number | null;
  searchtext: string;
  setSearchtext: (val: string) => void;
  sortoption: sortoption;
  setSortoption: (val: sortoption) => void;
  onOpenCustomer: (phone: string) => void;
  onOpenMenu: (customer: customer) => void;
}

export default function CustomerListCard({
  customers, now, searchtext, setSearchtext, sortoption, setSortoption,
  onOpenCustomer, onOpenMenu,
}: CustomerListCardProps) {
  const { t } = useTranslation('dashboard');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        background: 'var(--color-paper)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 5vw, 1.5rem)',
        margin: '0 auto',
        maxWidth: '640px',
        boxShadow: '0 8px 32px rgba(35,42,59,0.15)',
        borderTop: '4px solid var(--color-brass)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
        <h2 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
          {t('customerList')}
        </h2>
        <select
          value={sortoption}
          onChange={(e) => setSortoption(e.target.value as sortoption)}
          style={{
            marginLeft: 'auto', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)',
            background: 'transparent', border: '1px solid rgba(35,42,59,0.3)',
            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="name">{t('sortName')}</option>
          <option value="amount">{t('sortAmountDesc')}</option>
          <option value="time">{t('sortTimeOverdue')}</option>
        </select>
        <span style={{
          background: 'var(--color-brass)', color: 'var(--color-paper)',
          fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
        }}>
          {t('totalCount', { count: customers.length })}
        </span>
      </div>

      <LedgerField
        label=""
        value={searchtext}
        onChange={setSearchtext}
        placeholder={t('searchPlaceholder')}
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        }
      />

      {customers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: '14px', fontWeight: 500 }}>
          {t('noCustomerFound')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        <AnimatePresence mode="popLayout">
          {customers.map((c) => (
            <CustomerRow
              key={c.phone}
              customer={c}
              now={now}
              onOpen={onOpenCustomer}
              onMenuOpen={onOpenMenu}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}