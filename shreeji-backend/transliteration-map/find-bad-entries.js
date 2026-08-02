const fs = require('fs');
const { entries } = JSON.parse(fs.readFileSync('./curated-import.json', 'utf-8'));

const bad = entries.filter(e => !e.key || typeof e.key !== 'string' || e.key.trim() === '');
console.log(`Found ${bad.length} entries with missing/empty key:`);
console.log(JSON.stringify(bad, null, 2));