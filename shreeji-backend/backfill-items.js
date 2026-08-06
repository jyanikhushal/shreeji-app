// Backfills description_gu/description_hi on existing historical entries that don't have them yet.
// Uses the SAME resolveTranslation logic as live entries — checks productLanguage map first,
// falls back to the AI ensemble only for genuine gaps, and saves the result back to the map too.
//
// Safe to re-run: only touches entries missing description_gu OR description_hi.
// Never touches deposit entries.
//
// Usage: node backfill-items.js

require('dotenv').config();
const { db } = require('./firebase');
const { resolveTranslation } = require('./modules/productLanguage/productLanguageService');

const TARGET_PHONE = process.argv[2] || null; // if provided, only this customer's entries are processed

async function main() {
  if (TARGET_PHONE) {
    console.log(`Running in SINGLE-CUSTOMER mode, targeting phone: ${TARGET_PHONE}\n`);
  } else {
    console.log('Running for ALL customers across ALL maliks.\n');
  }

  const maliksSnap = await db.collection('maliks').get();

  let totalEntries = 0;
  let alreadyDone = 0;
  let deposits = 0;
  let updated = 0;
  let failed = 0;

  for (const malikDoc of maliksSnap.docs) {
    const customersSnap = await malikDoc.ref.collection('customers').get();

    for (const custDoc of customersSnap.docs) {
      if (TARGET_PHONE && custDoc.id !== TARGET_PHONE) continue;

      const entriesSnap = await custDoc.ref.collection('entries').get();

      for (const entryDoc of entriesSnap.docs) {
        const e = entryDoc.data();
        const desc = e.description || '';

        if (!desc) continue;
        totalEntries++;

        if (e.type === 'deposit' || desc.startsWith('Deposit')) {
          deposits++;
          continue;
        }

        if (e.description_gu && e.description_hi) {
          alreadyDone++;
          continue;
        }

        try {
          const { gu, hi } = await resolveTranslation(desc);
          await entryDoc.ref.update({
            description_gu: gu,
            description_hi: hi,
          });
          updated++;
          console.log(`[${updated}] "${desc}" -> ${gu} / ${hi}  (malik: ${malikDoc.id}, customer: ${custDoc.id})`);
        } catch (err) {
          failed++;
          console.error(`Failed on "${desc}" (malik: ${malikDoc.id}, customer: ${custDoc.id}):`, err.message);
        }
      }
    }
  }

  console.log('\n===== BACKFILL SUMMARY =====');
  console.log(`Total non-deposit entries scanned: ${totalEntries - deposits}`);
  console.log(`Already had translations: ${alreadyDone}`);
  console.log(`Newly updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Deposits skipped: ${deposits}`);
}

main().catch(err => console.error('Backfill failed:', err));