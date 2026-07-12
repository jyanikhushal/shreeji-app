// modules/notifications/pushSubscriptionController.js
const { db } = require('../../firebase');
const { sendNotification } = require('./notificationService');
const { buildNotificationContent } = require('./notificationTemplates');
const { writeHistoryEntry } = require('./notificationHistory');
const { NOTIFICATION_TYPES } = require('./notificationTypes');
async function subscribeToPush(req, res) {
  const { malikPhone, customerPhone, subscription } = req.body;
  if (!malikPhone || !customerPhone || !subscription) {
    return res.status(400).json({ error: 'malikPhone, customerPhone, subscription required' });
  }
  try {
    const customerRef = db.doc(`maliks/${malikPhone}/customers/${customerPhone}`);
    const doc = await customerRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Customer not found' });

    const existing = doc.data().pushSubscriptions || [];
    // Avoid duplicate subscriptions for the same endpoint (e.g. re-registering same device)
    const alreadyExists = existing.some((s) => s.endpoint === subscription.endpoint);
    if (!alreadyExists) {
      await customerRef.update({
        pushSubscriptions: [...existing, subscription],
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('subscribeToPush error:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}

async function unsubscribeFromPush(req, res) {
  const { malikPhone, customerPhone, endpoint } = req.body;
  try {
    const customerRef = db.doc(`maliks/${malikPhone}/customers/${customerPhone}`);
    const doc = await customerRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Customer not found' });

    const existing = doc.data().pushSubscriptions || [];
    const filtered = existing.filter((s) => s.endpoint !== endpoint);
    await customerRef.update({ pushSubscriptions: filtered });
    res.json({ success: true });
  } catch (err) {
    console.error('unsubscribeFromPush error:', err);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
}

async function initNotificationHistory(req, res) {
  const { malikPhone, customerPhone } = req.body;
  try {
    await db.doc(`maliks/${malikPhone}/customers/${customerPhone}`)
      .update({ notificationPermission: 'granted' });

    const malikDoc = await db.doc(`maliks/${malikPhone}`).get();
    const malikName = malikDoc.exists ? (malikDoc.data().shopName || 'digiKhata') : 'digiKhata';

    const entriesSnap = await db
      .collection(`maliks/${malikPhone}/customers/${customerPhone}/entries`)
      .where('type', '==', 'deposit')
      .orderBy('date', 'asc')
      .get();

    const deposits = entriesSnap.docs;

    // Silent backfill for every deposit EXCEPT the last one
    for (let i = 0; i < deposits.length - 1; i++) {
      const entry = deposits[i].data();
      const content = buildNotificationContent(NOTIFICATION_TYPES.DEPOSIT_CONFIRMATION, malikName, {
        amount: Math.abs(entry.amount),
        newBalance: entry.total,
      });
      await writeHistoryEntry(
        malikPhone, customerPhone,
        NOTIFICATION_TYPES.DEPOSIT_CONFIRMATION,
        content,
        entry.date.toDate()
      );
    }

    // Real push for the LAST deposit (if any deposits exist at all)
    if (deposits.length > 0) {
      const lastEntry = deposits[deposits.length - 1].data();
      await sendNotification(malikPhone, customerPhone, NOTIFICATION_TYPES.DEPOSIT_CONFIRMATION, {
        amount: lastEntry.amount,
        newBalance: lastEntry.total,
      });
    }

    // Real push for the reminder, always last in sequence
    const customerDoc = await db.doc(`maliks/${malikPhone}/customers/${customerPhone}`).get();
    await sendNotification(malikPhone, customerPhone, NOTIFICATION_TYPES.PAYMENT_REMINDER, {
      currentBalance: customerDoc.data().currentBalance,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('initNotificationHistory error:', err);
    res.status(500).json({ error: 'Failed to initialize notification history' });
  }
}
module.exports = { subscribeToPush, unsubscribeFromPush, initNotificationHistory };