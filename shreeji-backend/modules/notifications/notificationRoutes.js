// modules/notifications/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToPush, unsubscribeFromPush, initNotificationHistory, getNotificationHistory } = require('./pushSubscriptionController');

router.get('/history', getNotificationHistory);
router.post('/subscribe', subscribeToPush);
router.post('/unsubscribe', unsubscribeFromPush);
router.post('/init-history', initNotificationHistory);
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

const { runPaymentReminderCheck } = require('../../utils/scheduler');
router.post('/test-reminder-cron', async (req, res) => {
  await runPaymentReminderCheck();
  res.json({ success: true });
});

module.exports = router;