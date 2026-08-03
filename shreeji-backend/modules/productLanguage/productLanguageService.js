const { db } = require('../../firebase');

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

async function learnEntry(rawText, canonical_gu, canonical_hi, canonical_en, source = 'learned') {
  const key = normalizeKey(rawText);
  if (!key) return { added: false, reason: 'empty key' };

  const ref = db.collection(COLLECTION).doc(key);
  const existing = await ref.get();

  if (existing.exists) {
    return { added: false, reason: 'already exists' };
  }

  await ref.set({
    canonical_gu: canonical_gu || rawText,
    canonical_hi: canonical_hi || rawText,
    canonical_en: canonical_en || rawText,
    source,
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
      source: 'curated',
      createdAt: new Date(),
    });
    count++;

    if (count % 450 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  await batch.commit();
  return { imported: count };
}

function hasGujaratiScript(text) {
  return /[\u0A80-\u0AFF]/.test(text || '');
}

function hasDevanagariScript(text) {
  return /[\u0900-\u097F]/.test(text || '');
}

const { translateWithQwen } = require('./groqClient');

async function enrichWithAI(rawText) {
  const key = normalizeKey(rawText);
  if (!key) return;

  try {
    const result = await translateWithQwen(rawText);

    if (!hasGujaratiScript(result.gu) || !hasDevanagariScript(result.hi)) {
      console.log(`AI enrichment rejected for "${rawText}" — invalid script in response`);
      return;
    }

    const ref = db.collection(COLLECTION).doc(key);
    const existing = await ref.get();

    if (existing.exists && existing.data().source === 'curated') {
      return;
    }

    await ref.set({
      canonical_gu: result.gu,
      canonical_hi: result.hi,
      canonical_en: result.en || rawText,
      source: 'ai',
      createdAt: new Date(),
    });

    console.log(`AI-enriched "${rawText}" -> ${result.gu} / ${result.hi}`);
  } catch (err) {
    console.error(`AI enrichment failed for "${rawText}":`, err.message);
  }
}

async function resolveTranslation(rawText) {
  const key = normalizeKey(rawText);
  if (!key) return { gu: rawText, hi: rawText, en: rawText };

  const ref = db.collection(COLLECTION).doc(key);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data();
    return { gu: data.canonical_gu, hi: data.canonical_hi, en: data.canonical_en };
  }

  try {
    const result = await translateWithQwen(rawText);
    if (hasGujaratiScript(result.gu) && hasDevanagariScript(result.hi)) {
      await ref.set({
        canonical_gu: result.gu,
        canonical_hi: result.hi,
        canonical_en: result.en || rawText,
        source: 'ai',
        createdAt: new Date(),
      });
      return { gu: result.gu, hi: result.hi, en: result.en || rawText };
    }
    console.log(`AI returned invalid script for "${rawText}", using raw text`);
  } catch (err) {
    console.error(`AI resolve failed for "${rawText}":`, err.message);
  }

  return { gu: rawText, hi: rawText, en: rawText };
}
module.exports = { getAllEntries, learnEntry, bulkImportCurated, normalizeKey, enrichWithAI,resolveTranslation };