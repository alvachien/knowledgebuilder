/**
 * Clean qiaoji-cet6.json:
 *   1. Start from deduped file (exact duplicates already removed)
 *   2. Merge US/UK spelling variants (keep first occurrence, combine cnwords)
 *   3. Fix case-variant dead entries (Mercury, March, May, china)
 */
const fs = require('fs');

const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const data = require(path.join(ROOT, 'public/data/learnenglish/qiaoji-cet6.deduped.json'));

// ---- Build index ----
const wordIndex = new Map(); // enword -> index in data
data.forEach((item, i) => wordIndex.set(item.enword, i));
const wordSet = new Set(data.map(d => d.enword));

// ---- US/UK variant detection (same logic as analysis) ----
function getVariants(w) {
  const lower = w.toLowerCase();
  const variants = [];
  // -or <-> -our
  if (lower.endsWith('or') && lower.length >= 4) variants.push(lower.slice(0, -2) + 'our');
  if (lower.endsWith('our') && lower.length >= 5) variants.push(lower.slice(0, -3) + 'or');
  // -er <-> -re (consonant + re/er only)
  if (lower.endsWith('re') && lower.length >= 4) {
    const cons = lower[lower.length - 3];
    if (cons && !'aeiou'.includes(cons)) variants.push(lower.slice(0, -2) + 'er');
  }
  if (lower.endsWith('er') && lower.length >= 4) {
    const cons = lower[lower.length - 3];
    if (cons && !'aeiou'.includes(cons)) variants.push(lower.slice(0, -2) + 're');
  }
  // -ize <-> -ise
  if (lower.endsWith('ize')) variants.push(lower.slice(0, -3) + 'ise');
  if (lower.endsWith('ise')) variants.push(lower.slice(0, -3) + 'ize');
  // -ization <-> -isation
  if (lower.includes('ization')) variants.push(lower.replace(/ization/g, 'isation'));
  if (lower.includes('isation')) variants.push(lower.replace(/isation/g, 'ization'));
  // -log <-> -logue
  if (lower.endsWith('log') && lower.length >= 4) variants.push(lower + 'ue');
  if (lower.endsWith('logue')) variants.push(lower.slice(0, -2));
  // -ense <-> -ence
  if (lower.endsWith('ense')) variants.push(lower.slice(0, -4) + 'ence');
  if (lower.endsWith('ence')) variants.push(lower.slice(0, -4) + 'ense');
  // -ll- <-> -l-
  if (lower.includes('ll')) variants.push(lower.replace(/ll/g, 'l'));
  if (lower.includes('l') && !lower.includes('ll')) {
    for (let i = 0; i < lower.length; i++) {
      if (lower[i] === 'l') variants.push(lower.slice(0, i) + 'll' + lower.slice(i + 1));
    }
  }
  // -yse <-> -yze
  if (lower.endsWith('yse')) variants.push(lower.slice(0, -3) + 'yze');
  if (lower.endsWith('yze')) variants.push(lower.slice(0, -3) + 'yse');
  return variants;
}

// Find all US/UK pairs
const pairGroups = new Map(); // normalized_key -> [word1, word2]
const processed = new Set();

for (const w of wordSet) {
  const lower = w.toLowerCase();
  if (processed.has(lower)) continue;

  const variants = getVariants(w);
  const group = [w];

  for (const v of variants) {
    // Check exact case
    if (wordSet.has(v) && v !== w) {
      group.push(v);
      processed.add(v.toLowerCase());
    }
    // Check capitalized
    const cap = v.charAt(0).toUpperCase() + v.slice(1);
    if (wordSet.has(cap) && cap !== w) {
      group.push(cap);
      processed.add(cap.toLowerCase());
    }
  }

  if (group.length > 1) {
    processed.add(lower);
    pairGroups.set(lower, group);
  }
}

console.log('US/UK variant pairs found:', pairGroups.size);

// ---- Merge logic ----
// For each pair: keep the one that appears FIRST in the file as primary.
// Merge cnwords: split by English comma, deduplicate, rejoin.
// Strip cross-references like "(等于xxx)" or "（等于xxx）" since the referenced form is being removed.

function stripCrossRefs(cn) {
  return cn
    .replace(/\（等于[^）]+）/g, '')
    .replace(/\(等于[^)]+\)/g, '')
    .replace(/\（英国）/g, '')  // e.g., "（英国）工党" in labour
    .replace(/，$/g, '')
    .replace(/,$/g, '');
}

function mergeCnwords(cn1, cn2) {
  const parts1 = stripCrossRefs(cn1).split(',').map(s => s.trim()).filter(Boolean);
  const parts2 = stripCrossRefs(cn2).split(',').map(s => s.trim()).filter(Boolean);

  const result = [...parts1];
  const resultLower = new Set(result.map(r => r.toLowerCase()));

  for (const part of parts2) {
    // Skip if this exact content (case-insensitive) is already present
    if (resultLower.has(part.toLowerCase())) continue;
    // Skip if this part's POS is already covered with similar content
    const posMatch = part.match(/^([a-z]+\.)/i);
    if (posMatch) {
      const pos = posMatch[1].toLowerCase();
      // Check if the same POS already has a very similar entry
      const existingSamePos = result.filter(r => r.toLowerCase().startsWith(pos));
      if (existingSamePos.length > 0) {
        // Check if the new content is substantially different
        const newContent = part.slice(pos.length).trim();
        const isDuplicate = existingSamePos.some(ep => {
          const existingContent = ep.slice(pos.length).trim();
          return existingContent === newContent ||
            existingContent.includes(newContent) ||
            newContent.includes(existingContent);
        });
        if (isDuplicate) continue;
      }
    }
    result.push(part);
    resultLower.add(part.toLowerCase());
  }

  return result.join(',');
}

const removeIndices = new Set();
const mergeUpdates = new Map(); // index -> new cnword
const mergeLog = [];

for (const [, variants] of pairGroups) {
  // Find indices
  const indices = variants.map(v => wordIndex.get(v));
  const primaryIdx = Math.min(...indices);
  const secondaryIdx = Math.max(...indices);

  const primaryWord = data[primaryIdx].enword;
  const secondaryWord = data[secondaryIdx].enword;
  const primaryCn = data[primaryIdx].cnword;
  const secondaryCn = data[secondaryIdx].cnword;

  const mergedCn = mergeCnwords(primaryCn, secondaryCn);
  mergeUpdates.set(primaryIdx, mergedCn);
  removeIndices.add(secondaryIdx);

  mergeLog.push({
    kept: primaryWord,
    removed: secondaryWord,
    oldCn: primaryCn,
    mergedCn: mergedCn,
    discardedCn: secondaryCn
  });
}

// ---- Case variant fixes ----
// Remove dead uppercase forms: Mercury, March, May
// Remove dead lowercase form: china (China has the definition)
// Fix march definition to include verb meaning
const caseRemove = new Set(['Mercury', 'March', 'May', 'china']);

// Find march and fix its definition
const marchIdx = data.findIndex(d => d.enword === 'march');
const marchOldCn = data[marchIdx].cnword;
const marchNewCn = 'n. 三月；行军；前进；进行,vi. 行军；前进；游行,vt. 强迫…行进';

console.log('');
console.log('=== Case variant fixes ===');
for (const w of caseRemove) {
  const idx = wordIndex.get(w);
  if (idx !== undefined) {
    removeIndices.add(idx);
    console.log('  Removed: ' + w + ' (was: "' + data[idx].cnword.substring(0, 60) + '")');
  }
}
if (marchIdx >= 0) {
  mergeUpdates.set(marchIdx, marchNewCn);
  console.log('  Fixed: march');
  console.log('    Old: ' + marchOldCn);
  console.log('    New: ' + marchNewCn);
}

// ---- Build final array ----
const final = [];
for (let i = 0; i < data.length; i++) {
  if (removeIndices.has(i)) continue;
  const entry = { ...data[i] };
  if (mergeUpdates.has(i)) {
    entry.cnword = mergeUpdates.get(i);
  }
  final.push(entry);
}

// ---- Write output ----
const outputPath = path.join(ROOT, 'public/data/learnenglish/qiaoji-cet6.json');
const output = JSON.stringify(final, null, 4);
fs.writeFileSync(outputPath, output + '\n', 'utf-8');

const origSize = fs.statSync(path.join(ROOT, 'public/data/learnenglish/qiaoji-cet6.deduped.json')).size;
const newSize = fs.statSync(outputPath).size;

console.log('');
console.log('=== US/UK merges (', mergeLog.length, 'pairs) ===');
mergeLog.forEach(m => {
  console.log('  Kept: ' + m.kept + ' | Removed: ' + m.removed);
  console.log('    Old:    ' + m.oldCn.substring(0, 100));
  console.log('    Merged: ' + m.mergedCn.substring(0, 100));
  if (m.mergedCn.length > 100) console.log('           ' + m.mergedCn.substring(100));
  console.log('    Discarded: ' + m.discardedCn.substring(0, 100));
  console.log('');
});

console.log('=== Summary ===');
console.log('Input (deduped):   ', data.length, 'entries');
console.log('Output (cleaned):  ', final.length, 'entries');
console.log('  US/UK removed:   ', pairGroups.size);
console.log('  Case vars removed:', caseRemove.size);
console.log('  Total removed:   ', data.length - final.length);
console.log('File size:', (origSize / 1024).toFixed(1), 'KB ->', (newSize / 1024).toFixed(1), 'KB');

// Verify no duplicates remain
const finalWords = final.map(d => d.enword);
const finalUnique = new Set(finalWords);
console.log('');
console.log('Final unique enwords:', finalUnique.size, '/', finalWords.length);
console.log('Duplicates remaining:', finalWords.length !== finalUnique.size ? 'YES (BUG!)' : 'None');
