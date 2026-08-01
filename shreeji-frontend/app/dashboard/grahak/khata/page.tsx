'use client';

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { clearSession } from "@/app/utils/session";
import { useGrahakKhata } from "@/hooks/grahakKhata/useGrahakKhata";
import TopBar from "@/components/grahak-khata/TopBar";
import SummaryCards from "@/components/grahak-khata/SummaryCards";
import KhataTable from "@/components/grahak-khata/KhataTable";
import PermissionModal from "@/components/grahak-khata/modals/PermissionModal";
import HistoryPanel from "@/components/grahak-khata/modals/HistoryPanel";
import { useTranslation } from 'react-i18next';
function GrahakKhataInner() {
  const gk = useGrahakKhata();
  const { t } = useTranslation('grahakKhata');

  if (gk.loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: 'var(--color-paper)', borderRadius: 4,
          borderLeft: '6px solid var(--color-rule-red)',
          padding: 'clamp(1.25rem, 4vw, 1.75rem) clamp(1.5rem, 5vw, 2.5rem)',
          boxShadow: '0 12px 30px rgba(35,42,59,0.2)',
        }}>
          <p style={{ margin: 0, fontSize: 'clamp(14px, 4vw, 15px)', color: 'var(--color-ink)', fontWeight: 500, fontFamily: 'var(--font-rozha, serif)' }}>
            {t('openingKhata')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      padding: 'clamp(0.75rem, 3vw, 1.25rem)', position: 'relative',
    }}>
      <NavTransition show={gk.stamping} />
      <KiranaBackground />

      <div style={{
        position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto',
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column'
      }}>
        <TopBar
          phone={gk.phone}
          lastTotal={gk.lastTotal}
          hasEntries={gk.entries.length > 0}
          localGranted={gk.localGranted}
          onOpenHistory={gk.openHistoryPanel}
          onLogout={() => { clearSession("grahak"); gk.navigateTo("/login/grahak"); }}
        />

        <SummaryCards entries={gk.entries} />

        <KhataTable
          entries={gk.entries}
          lastTotal={gk.lastTotal}
          setLastRowRef={gk.setLastRowRef}
        />

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink)', opacity: 0.5, marginTop: 16, flexShrink: 0 }}>
          {t('readOnlyNotice')}
        </p>
      </div>

      <PermissionModal
        show={gk.permissionKnown && gk.showPermissionModal}
        enabling={gk.enabling}
        onDecline={gk.handleDeclineNotifications}
        onEnable={gk.handleEnableNotifications}
      />

      <HistoryPanel
        show={gk.showHistoryPanel}
        history={gk.history}
        historyLoading={gk.historyLoading}
        onClose={gk.closeHistoryPanel}
      />
    </div>
  );
}

export default function Page() {
  const { t } = useTranslation('grahakKhata');
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        color: 'var(--color-ink)', fontSize: '16px', fontWeight: 500
      }}>
       {t('loadingKhata')}
      </div>
    }>
      <GrahakKhataInner />
    </Suspense>
  );
}