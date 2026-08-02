// Read-only analysis script — makes NO writes to Firestore.
// Scans every customer's entries across all maliks, collects every unique
// non-deposit item name, checks each against the productLanguage map, and
// writes two output files:
//   - all-items.json      : every unique item name found in history
//   - unmapped-items.json : the subset with no match in the product language map,
//                            sorted by how often they occurred (most frequent first)
//
// Usage: node scan-items.js

require('dotenv').config();
const fs = require('fs');
const { db } = require('./firebase');
const { getAllEntries, normalizeKey } = require('./modules/productLanguage/productLanguageService');

async function main() {
  console.log('Loading product language map...');
  const productMap = await getAllEntries();
  console.log(`Loaded ${Object.keys(productMap).length} curated/learned entries.`);

  const maliksSnap = await db.collection('maliks').get();

  const itemCounts = {}; // normalizedKey -> { original, count }
  let totalEntries = 0;

  for (const malikDoc of maliksSnap.docs) {
    const customersSnap = await malikDoc.ref.collection('customers').get();

    for (const custDoc of customersSnap.docs) {
      const entriesSnap = await custDoc.ref.collection('entries').get();

      entriesSnap.docs.forEach(entryDoc => {
        const e = entryDoc.data();
        const desc = e.description || '';

        if (!desc) return;
        if (e.type === 'deposit') return;
        if (desc.startsWith('Deposit')) return;

        totalEntries++;
        const key = normalizeKey(desc);

        if (!itemCounts[key]) {
          itemCounts[key] = { original: desc, count: 0 };
        }
        itemCounts[key].count++;
      });
    }
  }

  const allItems = Object.entries(itemCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, { original }]) => ({
      key,
      original,
      gu: productMap[key] ? productMap[key].canonical_gu : null,
    }));

  const unmappedItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .filter(([key]) => !productMap[key])
    .map(([key, { original, count }]) => ({ key, original, count }));

  fs.writeFileSync('./all-items.json', JSON.stringify(allItems, null, 2), 'utf-8');
  fs.writeFileSync('./unmapped-items.json', JSON.stringify(unmappedItems, null, 2), 'utf-8');

  console.log(`\nTotal non-deposit entries scanned: ${totalEntries}`);
  console.log(`Unique items found: ${allItems.length}`);
  console.log(`Unmapped (no match in productLanguage): ${unmappedItems.length}`);
  console.log('\nWrote all-items.json and unmapped-items.json');
}

main().catch(err => console.error('Scan failed:', err));