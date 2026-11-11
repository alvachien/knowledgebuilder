// Bumps the project version in all four locations and refreshes the release date.
// Usage: node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Usage: node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// 1. package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 2 & 3. environment files - update version + releasedate
const envFiles = [
  'src/environments/environment.ts',
  'src/environments/environment.prod.ts',
];
for (const p of envFiles) {
  let txt = readFileSync(p, 'utf8');
  txt = txt.replace(/(version\s*:\s*)'[^']*'/, `$1'${newVersion}'`);
  txt = txt.replace(/(releasedate\s*:\s*)'[^']*'/, `$1'${today}'`);
  writeFileSync(p, txt);
}

// 4. package-lock.json — the root "version" fields must track package.json, otherwise
// npm reports drift (review finding U8, which re-broke on every bump). Only the two
// version fields are rewritten; dependency resolution is left untouched. Skipped
// silently when no lockfile exists.
const lockPath = 'package-lock.json';
let lockNote = 'package-lock.json not found - skipped';
if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const hits = [];
  if (lock.version !== undefined && lock.version !== newVersion) {
    lock.version = newVersion;
    hits.push('root version');
  }
  if (lock.packages && lock.packages[''] && lock.packages[''].version !== undefined) {
    lock.packages[''].version = newVersion;
    hits.push('packages[""].version');
  }
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  lockNote = hits.length
    ? `package-lock.json synced (${hits.join(', ')})`
    : 'package-lock.json already at ' + newVersion;
}

console.log(`Bumped ${oldVersion} -> ${newVersion} (releasedate ${today})`);
console.log('Updated: package.json, environment.ts, environment.prod.ts');
console.log(lockNote);
