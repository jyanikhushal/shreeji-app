const fs = require('fs');

const filename = process.argv[2] || './curated-import.json';
const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));

const lines = data.entries.map(e =>
  `${e.key},${e.canonical_gu},${e.canonical_hi},${e.canonical_en}`
);

fs.writeFileSync('./all-pairs.json', JSON.stringify(lines, null, 2), 'utf-8');
console.log(`Wrote ${lines.length} lines to all-pairs.json`);