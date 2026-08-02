require('dotenv').config();
const { db } = require('./firebase');
const fs = require('fs');

async function main() {
  const maliksSnap = await db.collection('maliks').get();

  const customerNames = new Set();
  const itemDescriptions = new Set();

  for (const malikDoc of maliksSnap.docs) {
    const customersSnap = await malikDoc.ref.collection('customers').get();

    for (const custDoc of customersSnap.docs) {
      const data = custDoc.data();
      if (data.name && !data.name_gu) {
        customerNames.add(data.name);
      }

      const entriesSnap = await custDoc.ref.collection('entries').get();
      entriesSnap.docs.forEach(entryDoc => {
        const e = entryDoc.data();
        if (e.description && !e.description_gu && e.type !== 'deposit' && !(e.description || '').startsWith('Deposit')) {
          itemDescriptions.add(e.description);
        }
      });
    }
  }

  const output = {
    customerNames: Array.from(customerNames),
    itemDescriptions: Array.from(itemDescriptions),
  };

  fs.writeFileSync('./export-output.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Exported ${output.customerNames.length} customer names and ${output.itemDescriptions.length} unique item descriptions to export-output.json`);
}

main().catch(err => console.error('Export failed:', err));