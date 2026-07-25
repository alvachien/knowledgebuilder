// Bumps the project version in all three locations and refreshes the release date.
// Usage: node .claude/skills/bump-version/bump-version.mjs <X.Y.Z>
import { readFileSync, writeFileSync } from 'node:fs';

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

console.log(`Bumped ${oldVersion} -> ${newVersion} (releasedate ${today})`);
console.log('Updated: package.json, environment.ts, environment.prod.ts');
