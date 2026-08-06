const express = require('express');
const router = express.Router();
const {
  submitPreorder,
  fetchQueue,
  changeStatus,
  checkKhataMatch,
  saveDestination,
  fetchGuestStatus,
} = require('./preorderController');

router.post('/', submitPreorder);
router.get('/:malikPhone/queue', fetchQueue);
router.patch('/:malikPhone/:preorderId/status', changeStatus);
router.get('/:malikPhone/khata-match/:guestPhone', checkKhataMatch);
router.patch('/:malikPhone/:preorderId/save', saveDestination);
router.get('/:malikPhone/guest-status/:guestPhone', fetchGuestStatus);

module.exports = router;