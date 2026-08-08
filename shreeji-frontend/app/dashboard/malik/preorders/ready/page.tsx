'use client';
export const dynamic = "force-dynamic";

import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useMalikSession } from "@/hooks/dashboard/useMalikSession";
import { useNavTransition } from "@/hooks/useNavTransition";
import { usePreorderReadyQueue } from "@/hooks/preorder/usePreorderReadyQueue";
import PreorderQueueList from "@/components/preorder/malik/PreorderQueueList";
import PreorderDetailModal from "@/components/preorder/malik/PreorderDetailModal";
import { useTranslation } from 'react-i18next';

export default function MalikPreorderReadyPage() {
  const { malikdata } = useMalikSession();
  const { navigateTo, stamping } = useNavTransition();
  const { t } = useTranslation('preorder');
  const ready = usePreorderReadyQueue(malikdata?.phone ?? null);

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

        <PreorderQueueList queue={ready.items} loading={ready.loading} onOpenDetail={ready.openDetail} />
      </div>

      <PreorderDetailModal
        key={ready.selectedPreorder?.id ?? "none"}
        show={ready.detailOpen}
        preorder={ready.selectedPreorder}
        khataMatchName={ready.khataMatchName}
        actionLoading={ready.actionLoading}
        onClose={ready.closeDetail}
        onStartPreparing={ready.startPreparing}
        onMarkReady={ready.markReady}
        onSaveDestination={ready.saveDestination}
      />
    </div>
  );
}