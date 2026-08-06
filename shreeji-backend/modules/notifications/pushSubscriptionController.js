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

    let targetRef = customerRef;
    let existing;

    if (doc.exists) {
      existing = doc.data().pushSubscriptions || [];
    } else {
      // Not a khata customer — check/create preorder guest identity
      const guestRef = db.doc(`preorderGuests/${customerPhone}`);
      const guestDoc = await guestRef.get();
      if (!guestDoc.exists) return res.status(404).json({ error: 'Customer not found' });
      targetRef = guestRef;
      existing = guestDoc.data().pushSubscriptions || [];
    }

    const alreadyExists = existing.some((s) => s.endpoint === subscription.endpoint);
    if (!alreadyExists) {
      await targetRef.update({
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

    let targetRef = customerRef;
    let existing;

    if (doc.exists) {
      existing = doc.data().pushSubscriptions || [];
    } else {
      const guestRef = db.doc(`preorderGuests/${customerPhone}`);
      const guestDoc = await guestRef.get();
      if (!guestDoc.exists) return res.status(404).json({ error: 'Customer not found' });
      targetRef = guestRef;
      existing = guestDoc.data().pushSubscriptions || [];
    }

    const filtered = existing.filter((s) => s.endpoint !== endpoint);
    await targetRef.update({ pushSubscriptions: filtered });
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

async function getNotificationHistory(req, res) {
  const { malikPhone, customerPhone } = req.query;
  if (!malikPhone || !customerPhone) {
    return res.status(400).json({ error: 'malikPhone and customerPhone required' });
  }
  try {
    const snap = await db
      .collection(`maliks/${malikPhone}/customers/${customerPhone}/notifications`)
      .orderBy('createdAt', 'desc')
      .get();

    const history = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        type: d.type,
        title: d.title,
        body: d.body,
        createdAt: d.createdAt.toDate().toISOString(),
      };
    });

    res.json({ history });
  } catch (err) {
    console.error('getNotificationHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
}
module.exports = { subscribeToPush, unsubscribeFromPush, initNotificationHistory, getNotificationHistory };