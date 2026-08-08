'use client';
export const dynamic = "force-dynamic";

import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useMalikSession } from "@/hooks/dashboard/useMalikSession";
import { useNavTransition } from "@/hooks/useNavTransition";
import { useMalikPreorderHistory } from "@/hooks/preorder/useMalikPreorderHistory";
import PreorderHistoryFilterBar from "@/components/preorder/malik/PreorderHistoryFilterBar";
import PreorderHistoryCard from "@/components/preorder/malik/PreorderHistoryCard";
import PreorderHistoryDetailPanel from "@/components/preorder/malik/PreorderHistoryDetailPanel";
import { useTranslation } from 'react-i18next';

export default function MalikPreorderHistoryPage() {
  const { malikdata } = useMalikSession();
  const { navigateTo, stamping } = useNavTransition();
  const { t } = useTranslation('preorder');
  const history = useMalikPreorderHistory(malikdata?.phone ?? null);

  if (!malikdata) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('loading')}</div>;
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigateTo('/dashboard/malik/preorders')}
            style={{
              background: 'transparent', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: 6,
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--color-ink)', fontSize: 13, fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('backToQueue')}
          </button>
        </div>

        <div style={{
          background: 'var(--color-paper)', borderRadius: 12, padding: 'clamp(1rem, 5vw, 1.5rem)',
          boxShadow: '0 8px 32px rgba(35,42,59,0.15)', borderTop: '4px solid var(--color-brass)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 16px' }}>
            {t('allOrdersTitle')}
          </h2>

          <PreorderHistoryFilterBar
            sortOption={history.sortOption} setSortOption={history.setSortOption}
            groupOption={history.groupOption} setGroupOption={history.setGroupOption}
          />

          {history.loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink)', opacity: 0.6 }}>{t('loading')}</div>
          )}

          {!history.loading && Object.entries(history.groupedOrders).map(([groupName, groupOrders]) => (
            <div key={groupName} style={{ marginBottom: 20 }}>
              {history.groupOption === "guest" && (
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-brass)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {groupName}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupOrders.map((order) => (
                  <PreorderHistoryCard key={order.id} order={order} onOpen={() => history.openOrder(order)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PreorderHistoryDetailPanel order={history.selectedOrder} onClose={history.closeOrder} />
    </div>
  );
}