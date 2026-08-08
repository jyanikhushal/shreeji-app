'use client';
export const dynamic = "force-dynamic";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import PermissionModal from "@/components/grahak-khata/modals/PermissionModal";
import PreorderChoiceScreen from "@/components/preorder/grahak/PreorderChoiceScreen";
import PreorderNameCapture from "@/components/preorder/grahak/PreorderNameCapture";
import PreorderItemTable from "@/components/preorder/grahak/PreorderItemTable";
import PreorderSendButton from "@/components/preorder/grahak/PreorderSendButton";
import PreorderNavbar from "@/components/preorder/grahak/PreorderNavbar";
import PreorderDashboardHome from "@/components/preorder/grahak/PreorderDashboardHome";
import PreorderHistoryList from "@/components/preorder/grahak/PreorderHistoryList";
import PreorderOrderPreview from "@/components/preorder/grahak/PreorderOrderPreview";
import PreorderLiveStatusBar from "@/components/preorder/grahak/PreorderLiveStatusBar";
import NoKhataPopup from "@/components/preorder/grahak/NoKhataPopup";
import { usePreorderGuestSession } from "@/hooks/preorder/usePreorderGuestSession";
import { usePreorderNotificationPermission } from "@/hooks/preorder/usePreorderNotificationPermission";
import { usePreorderItemRows } from "@/hooks/preorder/usePreorderItemRows";
import { usePreorderSubmit } from "@/hooks/preorder/usePreorderSubmit";
import { usePreorderHistory } from "@/hooks/preorder/usePreorderHistory";
import { usePreorderLiveStatus } from "@/hooks/preorder/usePreorderLiveStatus";
import { useNavTransition } from "@/hooks/useNavTransition";
import { useTranslation } from 'react-i18next';

export default function PreorderMalikPage() {
  const params = useParams();
  const malikPhone = params.malikId as string;
  const { stamping } = useNavTransition();
  const { t } = useTranslation('preorder');

  const session = usePreorderGuestSession(malikPhone);
  const notif = usePreorderNotificationPermission(session.phone, malikPhone);
  const rowsHook = usePreorderItemRows();
  const submitHook = usePreorderSubmit(malikPhone, session.phone);
  const historyHook = usePreorderHistory(malikPhone, session.phone);
  const liveStatus = usePreorderLiveStatus(malikPhone, session.phone);

  const [orderStep, setOrderStep] = useState<'table' | 'review'>('table');

  const pageWrapperStyle: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'flex-start',
    padding: 'clamp(1rem, 5vw, 2rem)',
    background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
    position: 'relative', overflow: 'hidden',
  };

  useEffect(() => {
    if (session.view !== "consent") return;
    if (!notif.permissionKnown) return;
    if (!session.nameLoaded) return;
    if (!notif.showPermissionModal) {
      session.proceedToName(session.name);
    }
  }, [session.view, notif.permissionKnown, notif.showPermissionModal, session.nameLoaded, session.name]);

  useEffect(() => {
    if (session.view === "history") historyHook.loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.view]);

  if (!session.authChecked) {
    return <div style={pageWrapperStyle}><KiranaBackground /></div>;
  }

  const handlePlaceOrder = () => {
    setOrderStep('table');
    session.goToOrder();
  };

  const handleBack = () => {
    setOrderStep('table');
    session.backToDashboard();
  };

  const handleSend = async () => {
    await submitHook.send(rowsHook.rows);
    if (submitHook.submittedPreorderId) {
      rowsHook.resetAll();
      setOrderStep('table');
      await liveStatus.refresh();
      session.backToDashboard();
    }
  };

  const showNavbar = session.view === "dashboard" || session.view === "order" || session.view === "history";
  const showLiveBar = session.view === "dashboard" || session.view === "history";

  return (
    <div style={pageWrapperStyle}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: showLiveBar ? 70 : 0 }}>

        {showNavbar && (
          <PreorderNavbar
            shopName="Shreeji Provision Store"
            guestName={session.name}
            onBack={session.view !== "dashboard" ? handleBack : undefined}
          />
        )}

        <AnimatePresence mode="wait">
          {session.view === "choice" && (
            <motion.div key="choice" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PreorderChoiceScreen onPlaceOrder={session.chooseOrder} onViewKhata={session.chooseKhata} />
            </motion.div>
          )}

          {session.view === "consent" && <motion.div key="consent-wait" exit={{ opacity: 0 }} />}

          {session.view === "name" && (
            <motion.div key="name" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PreorderNameCapture saving={session.savingName} onSubmit={session.submitName} />
            </motion.div>
          )}

          {session.view === "dashboard" && (
            <motion.div key="dashboard" exit={{ opacity: 0 }} style={{ width: '100%' }}>
              <PreorderDashboardHome
                guestName={session.name}
                onPlaceOrder={handlePlaceOrder}
                onViewHistory={session.goToHistory}
              />
            </motion.div>
          )}

          {session.view === "order" && orderStep === 'table' && (
            <motion.div key="order-table" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h1 style={{
                fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(20px, 6vw, 24px)',
                color: 'var(--color-ink)', textAlign: 'center', margin: 0, fontWeight: 400,
              }}>
                {t('orderTitle', { name: session.name })}
              </h1>
              <PreorderItemTable rowsHook={rowsHook} />
              <PreorderSendButton
                enabled={rowsHook.canSend}
                sending={false}
                onSend={() => setOrderStep('review')}
              />
            </motion.div>
          )}

          {session.view === "order" && orderStep === 'review' && (
            <motion.div key="order-review" exit={{ opacity: 0 }} style={{ width: '100%' }}>
              <PreorderOrderPreview
                rows={rowsHook.rows}
                sending={submitHook.sending}
                onEdit={() => setOrderStep('table')}
                onConfirm={handleSend}
              />
            </motion.div>
          )}

          {session.view === "history" && (
            <motion.div key="history" exit={{ opacity: 0 }} style={{ width: '100%' }}>
              <h1 style={{
                fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(20px, 6vw, 24px)',
                color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 16px', fontWeight: 400,
              }}>
                {t('pastOrdersTitle')}
              </h1>
              <PreorderHistoryList history={historyHook.history} loading={historyHook.loading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLiveBar && (
        <PreorderLiveStatusBar order={liveStatus.order} isCollectedTransient={liveStatus.isCollectedTransient} />
      )}

      <PermissionModal
        show={session.view === "consent" && notif.permissionKnown && notif.showPermissionModal}
        enabling={notif.enabling}
        onDecline={() => { notif.handleDeclineNotifications(); session.proceedToName(session.name); }}
        onEnable={async () => { await notif.handleEnableNotifications(); session.proceedToName(session.name); }}
      />

      <NoKhataPopup show={session.showNoKhataPopup} onClose={session.closeNoKhataPopup} />
    </div>
  );
}