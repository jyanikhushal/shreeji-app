const express = require('express');
const router = express.Router();
const { guestLogin, updateGuestName } = require('./preorderGuestController');const { guestLogin, updateGuestName, grantGuestNotificationPermission } = require('./preorderGuestController');
router.post('/login', guestLogin);
router.patch('/name', updateGuestName);
router.patch('/notification-permission', grantGuestNotificationPermission);
module.exports = router;