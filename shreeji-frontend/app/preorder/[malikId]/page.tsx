'use client';
export const dynamic = "force-dynamic";
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import KiranaBackground from "@/components/home/KiranaBackground";
import NavTransition from "@/components/NavTransition";
import PermissionModal from "@/components/grahak-khata/modals/PermissionModal";
import PreorderChoiceScreen from "@/components/preorder/grahak/PreorderChoiceScreen";
import PreorderNameCapture from "@/components/preorder/grahak/PreorderNameCapture";
import PreorderItemTable from "@/components/preorder/grahak/PreorderItemTable";
import PreorderSendButton from "@/components/preorder/grahak/PreorderSendButton";
import { usePreorderGuestSession } from "@/hooks/preorder/usePreorderGuestSession";
import { usePreorderNotificationPermission } from "@/hooks/preorder/usePreorderNotificationPermission";
import { usePreorderItemRows } from "@/hooks/preorder/usePreorderItemRows";
import { usePreorderSubmit } from "@/hooks/preorder/usePreorderSubmit";
import { useNavTransition } from "@/hooks/useNavTransition";
import { useTranslation } from 'react-i18next';
import NoKhataPopup from "@/components/preorder/grahak/NoKhataPopup";



export default function PreorderMalikPage() {
  const params = useParams();
  const malikPhone = params.malikId as string;
  const { stamping } = useNavTransition();
  const { t } = useTranslation('preorder');

  const session = usePreorderGuestSession(malikPhone);
  const notif = usePreorderNotificationPermission(session.phone, malikPhone);
  const rowsHook = usePreorderItemRows();
  const submitHook = usePreorderSubmit(malikPhone, session.phone);

  const pageWrapperStyle: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: 'clamp(1rem, 5vw, 2rem)',
    background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
    position: 'relative', overflow: 'hidden',
  };

  useEffect(() => {
  if (session.view !== "consent") return;
  if (!notif.permissionKnown) return;
  if (!session.nameLoaded) return; // wait until we know the real existing name

  if (!notif.showPermissionModal) {
    session.proceedToName(session.name);
  }
}, [session.view, notif.permissionKnown, notif.showPermissionModal, session.nameLoaded, session.name]);

  if (!session.authChecked) {
    return (
      <div style={pageWrapperStyle}>
        <KiranaBackground />
      </div>
    );
  }
  

  // After consent step resolves (grant or decline), move forward to name/order
  const handleConsentResolved = () => {
    notif.handleDeclineNotifications(); // closes modal regardless of path
    session.proceedToName(session.name);
  };

  const handleSend = async () => {
    await submitHook.send(rowsHook.rows);
    if (submitHook.submittedPreorderId) {
      rowsHook.resetAll();
    }
  };

  

  return (
    <div style={pageWrapperStyle}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        <AnimatePresence mode="wait">
          {session.view === "choice" && (
            <motion.div key="choice" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PreorderChoiceScreen
                onPlaceOrder={session.chooseOrder}
                onViewKhata={session.chooseKhata}
              />
            </motion.div>
          )}

          {session.view === "consent" && (
            // Consent handled via existing PermissionModal below; once notif.showPermissionModal
            // resolves (granted or declined), we move to name/order view.
            <motion.div key="consent-wait" exit={{ opacity: 0 }} />
          )}

          {session.view === "name" && (
            <motion.div key="name" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PreorderNameCapture
                saving={session.savingName}
                onSubmit={session.submitName}
              />
            </motion.div>
          )}

          {session.view === "order" && (
            <motion.div key="order" exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h1 style={{
                fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(20px, 6vw, 24px)',
                color: 'var(--color-ink)', textAlign: 'center', margin: 0, fontWeight: 400,
              }}>
                {t('orderTitle', { name: session.name })}
              </h1>
              <PreorderItemTable rowsHook={rowsHook} />
              <PreorderSendButton
                enabled={rowsHook.canSend}
                sending={submitHook.sending}
                onSend={handleSend}
              />
            </motion.div>
          )}

          {session.view === "khata" && (
            <motion.div key="khata" exit={{ opacity: 0 }} style={{
              background: 'var(--color-paper)', borderRadius: 4, padding: '2rem',
              borderLeft: '6px solid var(--color-rule-red)', textAlign: 'center',
            }}>
              <p style={{ color: 'var(--color-ink)' }}>{t('khataViewPlaceholder')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       <PermissionModal
        show={session.view === "consent" && notif.permissionKnown && notif.showPermissionModal}
        enabling={notif.enabling}
        onDecline={() => { notif.handleDeclineNotifications(); session.proceedToName(session.name); }}
        onEnable={async () => { await notif.handleEnableNotifications(); session.proceedToName(session.name); }}
      />

      <NoKhataPopup
        show={session.showNoKhataPopup}
        onClose={session.closeNoKhataPopup}
      />
    </div>
  );
}