// modules/notifications/pushSubscriptionController.js
const { db } = require('../../firebase');

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

module.exports = { subscribeToPush, unsubscribeFromPush };