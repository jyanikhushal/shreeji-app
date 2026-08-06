// modules/notifications/notificationService.js
const webpush = require('web-push');
const { db } = require('../../firebase'); // adjust path to your existing firebase init
const { buildNotificationContent } = require('./notificationTemplates');
const { writeHistoryEntry, pruneOldHistory } = require('./notificationHistory');
webpush.setVapidDetails(
  'mailto:youremail@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Central dispatcher. Every trigger in the system (event-driven or cron)
 * calls this same function — it's the only place that talks to web-push.
 */
async function sendNotification(malikPhone, customerPhone, type, payload = {}) {
  try {
    const malikDoc = await db.doc(`maliks/${malikPhone}`).get();
    const malikName = malikDoc.exists ? (malikDoc.data().shopName || 'digiKhata') : 'digiKhata';

   const customerRef = db.doc(`maliks/${malikPhone}/customers/${customerPhone}`);
    const customerDoc = await customerRef.get();

    let subscriptionHolderRef = customerRef;
    let subscriptions = [];

    if (customerDoc.exists) {
      subscriptions = customerDoc.data().pushSubscriptions || [];
    } else {
      // Not a khata customer — check preorder guest identity instead
      const guestRef = db.doc(`preorderGuests/${customerPhone}`);
      const guestDoc = await guestRef.get();
      if (!guestDoc.exists) return;
      subscriptionHolderRef = guestRef;
      subscriptions = guestDoc.data().pushSubscriptions || [];
    }

    if (subscriptions.length === 0) return; 

    const content = buildNotificationContent(type, malikName, payload);
    await writeHistoryEntry(malikPhone, customerPhone, type, content);
    await pruneOldHistory(malikPhone, customerPhone);
    const message = JSON.stringify(content);

    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub, message))
    );

    // Prune dead subscriptions (expired/unsubscribed browsers return 410/404)
    const deadIndexes = [];
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        const statusCode = result.reason?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          deadIndexes.push(idx);
        } else {
          console.error(`Push failed for ${customerPhone}:`, result.reason?.body || result.reason);
        }
      }
    });

    if (deadIndexes.length > 0) {
      const cleaned = subscriptions.filter((_, idx) => !deadIndexes.includes(idx));
      await subscriptionHolderRef.update({ pushSubscriptions: cleaned });
    }
  } catch (err) {
    console.error('sendNotification error:', err);
    // Deliberately swallow — a failed push should never break the calling flow
    // (e.g. addDepositEntry.js should still succeed even if push fails)
  }
}

module.exports = { sendNotification };