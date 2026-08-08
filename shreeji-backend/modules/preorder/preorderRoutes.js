const express = require('express');
const router = express.Router();
const {
  submitPreorder,
  fetchQueue,
  changeStatus,
  checkKhataMatch,
  saveDestination,
  fetchGuestStatus,
  fetchGuestHistory,
} = require('./preorderController');

router.post('/', submitPreorder);
router.get('/:malikPhone/queue', fetchQueue);
router.patch('/:malikPhone/:preorderId/status', changeStatus);
router.get('/:malikPhone/khata-match/:guestPhone', checkKhataMatch);
router.patch('/:malikPhone/:preorderId/save', saveDestination);
router.get('/:malikPhone/guest-status/:guestPhone', fetchGuestStatus);
router.get('/:malikPhone/guest-history/:guestPhone', fetchGuestHistory);
router.get('/:malikPhone/all-orders', fetchAllOrders);
module.exports = router;