const express = require('express');
const router = express.Router();
const { getProductLanguageMap, learnProductLanguage, bulkImportProductLanguage } = require('./productLanguageController');

router.get('/', getProductLanguageMap);
router.post('/learn', learnProductLanguage);
router.post('/bulk', bulkImportProductLanguage);

module.exports = router;