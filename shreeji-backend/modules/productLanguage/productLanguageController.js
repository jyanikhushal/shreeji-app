const { getAllEntries, learnEntry, bulkImportCurated } = require('./productLanguageService');

async function getProductLanguageMap(req, res) {
  try {
    const map = await getAllEntries();
    return res.status(200).json({ success: true, data: map });
  } catch (err) {
    console.error('Error fetching product language map:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function learnProductLanguage(req, res) {
  try {
    const { rawText, canonical_gu, canonical_hi, canonical_en, source } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, message: 'Missing rawText' });
    }
    const result = await learnEntry(rawText, canonical_gu, canonical_hi, canonical_en, source);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('Error learning product language entry:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function bulkImportProductLanguage(req, res) {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) {
      return res.status(400).json({ success: false, message: 'entries must be an array' });
    }
    const result = await bulkImportCurated(entries);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('Error bulk importing product language:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getProductLanguageMap, learnProductLanguage, bulkImportProductLanguage };