// validate-schema.js
// Validates all JSON exercise files in public/data/knowledge-exercises against exercise-schema.json
// Usage: node tools/validate-schema.js

const Ajv = require('ajv/dist/2020');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, 'exercise-schema.json');
const EXERCISE_DIR = path.resolve(__dirname, '..', 'public', 'data', 'knowledge-exercises');
const EXCLUDE_FILES = ['data.json'];

function isPlaceholder(id) {
  return id && (id.startsWith('example-') || id.startsWith('999-'));
}

function main() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const validate = ajv.compile(schema);

  const files = fs.readdirSync(EXERCISE_DIR).filter(f => f.endsWith('.json') && !EXCLUDE_FILES.includes(f));

  let totalErrors = 0;
  let filesWithErrors = [];
  const allErrorsByFile = {};

  for (const file of files) {
    const filePath = path.join(EXERCISE_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const valid = validate(data);
    if (!valid) {
      const filtered = [];
      for (const err of validate.errors) {
        const parts = err.instancePath.split('/').filter(Boolean);
        let skip = false;
        if (parts.length >= 1) {
          const itemIdx = parts[0];
          if (!isNaN(itemIdx)) {
            const item = data[parseInt(itemIdx)];
            if (isPlaceholder(item?.id)) { skip = true; }
          }
        }
        if (!skip) { filtered.push(err); }
      }

      if (filtered.length > 0) {
        filesWithErrors.push(file);
        allErrorsByFile[file] = filtered;
        totalErrors += filtered.length;
      } else {
        console.log(`\u2713 ${file} - all errors from placeholder items`);
      }
    } else {
      console.log(`\u2713 ${file} - schema OK`);
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total files: ${files.length}`);
  console.log(`Files with errors: ${filesWithErrors.length}`);
  console.log(`Total schema errors: ${totalErrors}`);

  for (const file of filesWithErrors) {
    console.log(`\n=== ${file} (${allErrorsByFile[file].length} errors) ===`);
    for (const err of allErrorsByFile[file]) {
      console.log(`  Path: ${err.instancePath || '(root)'} | ${err.message}`);
    }
  }

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
