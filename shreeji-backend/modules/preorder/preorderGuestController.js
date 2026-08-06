const { getGuest, createGuestIfNotExists, setGuestName, grantNotificationPermission } = require('./preorderGuestService');

async function grantGuestNotificationPermission(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing phone' });
    }
    await grantNotificationPermission(phone);
    return res.status(200).json({ success: true, message: 'Permission recorded' });
  } catch (err) {
    console.error('Error in grantGuestNotificationPermission:', err);
    if (err.message === 'Guest not found') {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { guestLogin, updateGuestName, grantGuestNotificationPermission };