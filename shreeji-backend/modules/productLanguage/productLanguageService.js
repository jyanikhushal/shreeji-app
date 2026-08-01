const { db } = require('../../firebase'); // ⚠️ adjust path if your firebase.js sits elsewhere relative to this folder

const COLLECTION = 'productLanguage';

function normalizeKey(text) {
  return (text || '').trim().toLowerCase();
}

async function getAllEntries() {
  const snap = await db.collection(COLLECTION).get();
  const map = {};
  snap.docs.forEach(doc => {
    map[doc.id] = doc.data();
  });
  return map;
}

async function learnEntry(rawText, canonical_gu, canonical_hi, canonical_en) {
  const key = normalizeKey(rawText);
  if (!key) return { added: false, reason: 'empty key' };

  const ref = db.collection(COLLECTION).doc(key);
  const existing = await ref.get();

  if (existing.exists) {
    return { added: false, reason: 'already exists' }; // never overwrite — protects curated entries
  }

  await ref.set({
    canonical_gu: canonical_gu || rawText,
    canonical_hi: canonical_hi || rawText,
    canonical_en: canonical_en || rawText,
    source: 'learned',
    createdAt: new Date(),
  });

  return { added: true };
}

async function bulkImportCurated(entries) {
  let count = 0;
  let batch = db.batch();

  for (const entry of entries) {
    const key = normalizeKey(entry.key);
    if (!key) continue;

    const ref = db.collection(COLLECTION).doc(key);
    batch.set(ref, {
      canonical_gu: entry.canonical_gu,
      canonical_hi: entry.canonical_hi,
      canonical_en: entry.canonical_en,
      source: 'curated', // curated import always overwrites — intentional, this is the trusted source
      createdAt: new Date(),
    });
    count++;

    if (count % 450 === 0) { // Firestore batch limit is 500 ops — commit and start a fresh batch
      await batch.commit();
      batch = db.batch();
    }
  }

  await batch.commit();
  return { imported: count };
}

module.exports = { getAllEntries, learnEntry, bulkImportCurated, normalizeKey };