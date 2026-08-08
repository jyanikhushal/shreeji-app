'use client';
export const dynamic = "force-dynamic";

import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useMalikSession } from "@/hooks/dashboard/useMalikSession";
import { useNavTransition } from "@/hooks/useNavTransition";
import { usePreorderQueue } from "@/hooks/preorder/usePreorderQueue";
import PreorderQueueList from "@/components/preorder/malik/PreorderQueueList";
import PreorderDetailModal from "@/components/preorder/malik/PreorderDetailModal";
import { useTranslation } from 'react-i18next';

export default function MalikPreordersPage() {
  const { malikdata } = useMalikSession();
  const { navigateTo, stamping } = useNavTransition();
  const { t } = useTranslation('preorder');
  const queue = usePreorderQueue(malikdata?.phone ?? null);

  if (!malikdata) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6b7280' }}>
        {t('loading')}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '700px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem',
        }}>
          <button
            onClick={() => navigateTo('/dashboard/malik')}
            style={{
              background: 'transparent', border: '1px dashed rgba(35,42,59,0.3)',
              borderRadius: 6, padding: '8px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--color-ink)', fontSize: 13, fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('backToDashboard')}
          </button>
        </div>

        <PreorderQueueList
          queue={queue.items}
          loading={queue.loading}
          onOpenDetail={queue.openDetail}
        />
      </div>

      <PreorderDetailModal
  show={queue.detailOpen}
  preorder={queue.selectedPreorder}
  khataMatchName={queue.khataMatchName}
  actionLoading={queue.actionLoading}
  onClose={queue.closeDetail}
  onStartPreparing={queue.startPreparing}
  onMarkReady={queue.markReady}
  onSaveDestination={queue.saveDestination}
/>
    </div>
  );
}