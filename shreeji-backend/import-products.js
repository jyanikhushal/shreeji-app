// One-time script to bulk-import curated product language data.
// Run with: node import-products.js
//
// Before running: set API_URL below to your TEST backend URL
// (never point this at production without testing first).

const fs = require('fs');

const API_URL = 'https://shreeji-backend-test.onrender.com'; // ⚠️ change if needed

async function main() {
  const raw = fs.readFileSync('./curated-import.json', 'utf-8');
  const { entries } = JSON.parse(raw);

  console.log(`Importing ${entries.length} entries...`);

  const res = await fetch(`${API_URL}/productLanguage/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries }),
  });

  const json = await res.json();
  console.log('Result:', json);
}

main().catch(err => console.error('Import failed:', err));