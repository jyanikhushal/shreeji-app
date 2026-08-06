const { getGuest, createGuestIfNotExists, setGuestName } = require('./preorderGuestService');

async function guestLogin(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing phone' });
    }
    const guest = await createGuestIfNotExists(phone);
    return res.status(200).json({ success: true, message: 'Guest session ready', data: guest });
  } catch (err) {
    console.error('Error in guestLogin:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updateGuestName(req, res) {
  try {
    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Missing phone or name' });
    }
    const guest = await setGuestName(phone, name);
    return res.status(200).json({ success: true, message: 'Name saved', data: guest });
  } catch (err) {
    console.error('Error in updateGuestName:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function grantGuestNotificationPermission(req, res) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing phone' });
    }
    const ref = db.doc(`preorderGuests/${phone}`);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    await ref.update({ notificationPermission: 'granted' });
    return res.status(200).json({ success: true, message: 'Permission recorded' });
  } catch (err) {
    console.error('Error in grantGuestNotificationPermission:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { guestLogin, updateGuestName, grantGuestNotificationPermission };

