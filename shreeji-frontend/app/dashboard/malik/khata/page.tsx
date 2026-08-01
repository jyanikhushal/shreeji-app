'use client';

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import { useRunningKhata } from "@/hooks/runningKhata/useRunningKhata";
import TopBar from "@/components/running-khata/TopBar";
import StatusBanner from "@/components/running-khata/StatusBanner";
import KhataTable from "@/components/running-khata/KhataTable";
import DepositModal from "@/components/running-khata/modals/DepositModal";
import RowOptionsModal from "@/components/running-khata/modals/RowOptionsModal";
import DeleteConfirmModal from "@/components/running-khata/modals/DeleteConfirmModal";
import { useTranslation } from 'react-i18next';
function RunningKhataInner() {
  const rk = useRunningKhata();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: 'clamp(1rem, 4vw, 2rem)', paddingBottom: '4rem',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative',
    }}>
      <NavTransition show={rk.stamping} />
      <KiranaBackground />

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '1.5rem', zIndex: 110, background: '#E8DCC0',
      }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <StatusBanner loading={rk.loading} error={rk.error} />

        <TopBar
          customername={rk.customername}
          customerphone={rk.customerphone}
          entries={rk.entries}
          onback={() => rk.navigateto('/dashboard/malik')}
          ondeposit={rk.opendeposit}
        />

        <KhataTable
          entries={rk.entries}
          editingrow={rk.editingrow}
          issubmitting={rk.issubmitting}
          setrowref={rk.setrowref}
          setitemref={rk.setitemref}
          setamountref={rk.setamountref}
          onitemchange={(index, value) => rk.handlechange(index, 'item', value)}
          onamountchange={(index, value) => rk.handlechange(index, 'amount', value)}
          onitementer={rk.handleitementer}
          onamountenter={rk.handleamountenter}
          onamountblur={rk.handleamountblur}
          onrownumberclick={rk.openrowmenu}
        />
      </div>

      <DepositModal
        show={rk.showdeposit}
        customername={rk.customername}
        depositamount={rk.depositamount}
        setDepositamount={rk.setdepositamount}
        issubmitting={rk.issubmitting}
        onCancel={rk.closedeposit}
        onConfirm={rk.confirmdeposit}
      />

      <RowOptionsModal
        show={rk.showrowmenu}
        entryNo={rk.selectedrow !== null ? rk.entries[rk.selectedrow]?.entryNo : undefined}
        onEditRow={rk.starteditingselected}
        onDeleteRow={rk.opendeleteconfirm}
        onCancel={rk.closerowmenu}
      />

      <DeleteConfirmModal
        show={rk.showdeleteconfirm}
        onCancel={rk.closedeleteconfirm}
        onConfirm={rk.confirmdelete}
      />
    </div>
  );
}

export default function RunningKhataPage() {
  const { t } = useTranslation('runningKhata');
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--color-paper)',
          borderRadius: '12px', padding: '2rem 3rem', textAlign: 'center',
          boxShadow: '0 8px 30px rgba(35,42,59,0.15)', borderLeft: '6px solid var(--color-brass)'
        }}>
          <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-ink)', fontWeight: 600 }}>{t('loadingKhata')}</p>
        </div>
      </div>
    }>
      <RunningKhataInner />
    </Suspense>
  );
}