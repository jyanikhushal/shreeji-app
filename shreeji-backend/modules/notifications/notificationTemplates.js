// modules/notifications/notificationTemplates.js
const { NOTIFICATION_TYPES } = require('./notificationTypes');

const DIGIKHATA_ICON = 'https://shreeji-5dfuluu8v-jyani-khushals-projects.vercel.app/digiKhata-logo.png';
const DIGIKHATA_BADGE = 'https://shreeji-5dfuluu8v-jyani-khushals-projects.vercel.app/digiKhata-logo.png';

// Each builder takes (malikBusinessName, payload) and returns the push content.
// payload is type-specific data (e.g. amount, customerName).
const templateBuilders = {
  [NOTIFICATION_TYPES.DEPOSIT_CONFIRMATION]: (malikName, payload) => ({
  title: malikName,
  body: `Deposit of ₹${Math.abs(payload.amount)} received. Updated balance: ₹${payload.newBalance}`,
  icon: DIGIKHATA_ICON,
  badge: DIGIKHATA_BADGE,
  data: { type: NOTIFICATION_TYPES.DEPOSIT_CONFIRMATION, ...payload },
}),

  [NOTIFICATION_TYPES.PAYMENT_REMINDER]: (malikName, payload) => ({
    title: malikName,
    body: `Reminder: You have an outstanding balance of ₹${payload.currentBalance}. Please clear it soon.`,
    icon: DIGIKHATA_ICON,
    badge: DIGIKHATA_BADGE,
    data: { type: NOTIFICATION_TYPES.PAYMENT_REMINDER, ...payload },
  }),
};

function buildNotificationContent(type, malikName, payload) {
  const builder = templateBuilders[type];
  if (!builder) {
    throw new Error(`No template registered for notification type: ${type}`);
  }
  return builder(malikName, payload);
}

module.exports = { buildNotificationContent };