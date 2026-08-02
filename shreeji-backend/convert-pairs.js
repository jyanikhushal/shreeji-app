// Converts lines like: "key,gu,hi,en" (as a JSON array of strings)
// into the { "entries": [ { "key":..., "canonical_gu":..., "canonical_hi":..., "canonical_en":... } ] }
// format expected by the /productLanguage/bulk import endpoint.
//
// Usage: node convert-pairs.js input.json output.json
// - input.json  : a JSON array of "key,gu,hi,en" strings
// - output.json : where the converted entries get written (default: converted-import.json)

const fs = require('fs');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || './converted-import.json';

if (!inputFile) {
  console.error('Usage: node convert-pairs.js input.json [output.json]');
  process.exit(1);
}

const raw = fs.readFileSync(inputFile, 'utf-8');
const allLines = JSON.parse(raw);

const blankCount = allLines.filter(l => !l || !l.trim()).length;
const lines = allLines.filter(l => l && l.trim());

const entries = [];
const skipped = [];

for (const line of lines) {
  // split on comma, but only into exactly 4 parts (in case gu/hi text ever contains extra commas)
  const parts = line.split(',');

  if (parts.length < 4) {
    skipped.push(line);
    continue;
  }

  const key = parts[0].trim();
  const canonical_en = parts[parts.length - 1].trim();
  const canonical_hi = parts[parts.length - 2].trim();
  const canonical_gu = parts.slice(1, parts.length - 2).join(',').trim();

  if (!key || !canonical_gu || !canonical_hi || !canonical_en) {
    skipped.push(line);
    continue;
  }

  entries.push({ key, canonical_gu, canonical_hi, canonical_en });
}

fs.writeFileSync(outputFile, JSON.stringify({ entries }, null, 2), 'utf-8');

console.log(`Converted ${entries.length} entries -> ${outputFile}`);
if (blankCount > 0) {
  console.log(`Ignored ${blankCount} blank lines.`);
}
if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length} malformed (non-blank) lines:`);
  console.log(skipped);
}