const express = require('express');
const router = express.Router();
const { updateMalikLanguage, updateGrahakLanguage } = require('./languageController');

router.patch('/malik/:malikPhone', updateMalikLanguage);
router.patch('/grahak/:grahakPhone', updateGrahakLanguage);

module.exports = router;