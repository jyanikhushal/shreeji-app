const {
  createPreorder,
  getQueue,
  updateStatus,
  findKhataMatch,
  finalizeSave,
  getGuestPreorderStatus,
} = require('./preorderService');
const { sendNotification } = require('../notifications/notificationService');
const { NOTIFICATION_TYPES } = require('../notifications/notificationTypes');

async function submitPreorder(req, res) {
  try {
    const { malikPhone, guestPhone, items } = req.body;
    if (!malikPhone || !guestPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing malikPhone, guestPhone, or items' });
    }
    const preorder = await createPreorder(malikPhone, guestPhone, items);
    return res.status(200).json({ success: true, message: 'Preorder submitted', data: preorder });
  } catch (err) {
    console.error('Error in submitPreorder:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function fetchQueue(req, res) {
  try {
    const { malikPhone } = req.params;
    const queue = await getQueue(malikPhone);
    return res.status(200).json({ success: true, message: 'Queue fetched', data: queue });
  } catch (err) {
    console.error('Error in fetchQueue:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function changeStatus(req, res) {
  try {
    const { malikPhone, preorderId } = req.params;
    const { status } = req.body;
    if (!['pending', 'in_progress', 'ready', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await updateStatus(malikPhone, preorderId, status);

    if (status === 'ready') {
      await sendNotification(malikPhone, updated.guestPhone, NOTIFICATION_TYPES.PREORDER_READY, {
        preorderId,
      });
    }

    return res.status(200).json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    console.error('Error in changeStatus:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function checkKhataMatch(req, res) {
  try {
    const { malikPhone, guestPhone } = req.params;
    const match = await findKhataMatch(malikPhone, guestPhone);
    return res.status(200).json({ success: true, message: 'Match checked', data: match });
  } catch (err) {
    console.error('Error in checkKhataMatch:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function saveDestination(req, res) {
  try {
    const { malikPhone, preorderId } = req.params;
    const { savedAs, savedNames } = req.body;
    if (!['normal', 'khata'].includes(savedAs)) {
      return res.status(400).json({ success: false, message: 'Invalid savedAs value' });
    }
    if (savedAs === 'khata' && (!savedNames || !savedNames.typedByCustomer || !savedNames.khataRegisteredName)) {
      return res.status(400).json({ success: false, message: 'Missing savedNames for khata save' });
    }
    const finalized = await finalizeSave(malikPhone, preorderId, savedAs, savedNames || null);
    return res.status(200).json({ success: true, message: 'Preorder finalized', data: finalized });
  } catch (err) {
    console.error('Error in saveDestination:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function fetchGuestStatus(req, res) {
  try {
    const { malikPhone, guestPhone } = req.params;
    const status = await getGuestPreorderStatus(malikPhone, guestPhone);
    return res.status(200).json({ success: true, message: 'Status fetched', data: status });
  } catch (err) {
    console.error('Error in fetchGuestStatus:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  submitPreorder,
  fetchQueue,
  changeStatus,
  checkKhataMatch,
  saveDestination,
  fetchGuestStatus,
};