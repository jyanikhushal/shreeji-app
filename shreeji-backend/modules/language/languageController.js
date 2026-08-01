const { db } = require('../../firebase'); // ⚠️ adjust this path/name to match your existing pattern

async function updateMalikLanguage(req, res) {
  try {
    const { malikPhone } = req.params;
    const { language } = req.body;

    if (!['gu', 'hi', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    await db.collection('maliks').doc(malikPhone).set(
      { preferredLanguage: language },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating malik language:', err);
    return res.status(500).json({ error: 'Failed to update language' });
  }
}

async function updateGrahakLanguage(req, res) {
  try {
    const { grahakPhone } = req.params;
    const { language } = req.body;

    if (!['gu', 'hi', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    await db.collection('grahaks').doc(grahakPhone).set(
      { preferredLanguage: language },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating grahak language:', err);
    return res.status(500).json({ error: 'Failed to update language' });
  }
}

module.exports = { updateMalikLanguage, updateGrahakLanguage };