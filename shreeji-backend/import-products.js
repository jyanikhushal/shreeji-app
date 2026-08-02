const fs = require('fs');

const API_URL = 'https://shreeji-backend-test.onrender.com'; // ⚠️ confirm this matches your test URL
const BATCH_SIZE = 400;

async function main() {
  const filename = process.argv[2] || './curated-import.json';
  const raw = fs.readFileSync(filename, 'utf-8');
  const { entries } = JSON.parse(raw);

  console.log(`Importing ${entries.length} entries from ${filename} in batches of ${BATCH_SIZE}...`);

  let totalImported = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${API_URL}/productLanguage/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: batch }),
    });

    const json = await res.json();
    console.log(`Batch ${i / BATCH_SIZE + 1}: `, json);
    if (json.imported) totalImported += json.imported;
  }

  console.log(`Done. Total imported: ${totalImported}`);
}

main().catch(err => console.error('Import failed:', err));