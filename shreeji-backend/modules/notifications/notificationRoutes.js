// modules/notifications/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToPush, unsubscribeFromPush, initNotificationHistory } = require('./pushSubscriptionController');
router.post('/subscribe', subscribeToPush);
router.post('/unsubscribe', unsubscribeFromPush);
router.post('/init-history', initNotificationHistory);
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;