// modules/notifications/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToPush, unsubscribeFromPush } = require('./pushSubscriptionController');

router.post('/subscribe', subscribeToPush);
router.post('/unsubscribe', unsubscribeFromPush);

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

module.exports = router;