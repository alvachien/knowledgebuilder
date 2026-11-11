# Tools

Inventory of `tools/` as of 2026-11-07. Most of these are **historical authoring helpers** — content canonicalization moved to the `knowledgebuilder-content` repo long ago, and several scripts still reference the removed `public/data/` path (marked ⚠️ below). The maintained schema validation lives in `knowledgebuilder-content/util/validate-schema.js` (`npm run validate` there).

| Tool | Status | Purpose |
|---|---|---|
| `parse_questions.py` / `.ps1` | usable | Question text → JSON |
| `cutmp3v2.py` | usable (needs pydub) | MP3 splitting by JSON rules |
| `cutmp3.py` | example only | MP3 cut (hardcoded paths) |
| `analyze_vocabularies.py` | ⚠️ stale default path | Extract vocab from listening JSON |
| `enwordjson2excel.py` | usable (needs pandas) | Word JSON → Excel export |
| `find_duplicates.py` | ⚠️ hardcoded `public/data` dir | Duplicate `enword` scanner |
| `clean-cet6.js` | ⚠️ stale (removed `public/data`) | CET-6 word list cleanup (one-off) |
| `validate-schema.js` + `exercise-schema.json` + `exercise-validation-report.md` | stale | Superseded by content repo |
| `another.py` | unrelated | Chinese chess demo — not a project tool |

## `parse_questions.py` / `parse_questions.ps1`

A Python script that parses question text files into structured JSON, plus a PowerShell wrapper.

### Usage (wrapper)

1. Navigate to the `tools` folder:
```
cd tools
```
2. Update `question.txt` with your questions.
3. Execute the script from the same folder:
```
.\parse_questions.ps1 wk16-friday-
```
4. Check the result in `questions.json` under the same `tools` folder.

### Usage (direct)

```
python tools/parse_questions.py <input_file> <output_file> [prefix]
```

## `cutmp3v2.py`

Splits one MP3 into many segments according to a JSON rules file (used historically for the `ltt1_mp3/` listening clips before audio moved to the content repo). Requires `pydub` (+ ffmpeg).

```
python tools/cutmp3v2.py <input.mp3> <rules.json> [--outdir output_segments] [--overwrite] [--bitrate 128k]
```

Output filenames are sanitized to `[A-Za-z0-9._-]`; name collisions get a numeric suffix unless `--overwrite`.

## `cutmp3.py`

Minimal `pydub` example that cuts one interval from an MP3. Paths/timestamps are hardcoded near the bottom of the file — edit them before running. Prefer `cutmp3v2.py`.

## `analyze_vocabularies.py`

Analyzes an English-listening JSON file and extracts vocabulary to a JSON list of `{ "enword", "cnword" }`, using a built-in translation dictionary for words missing Chinese text. Requires Python 3 only (stdlib).

```
python tools/analyze_vocabularies.py <listening.json>
```

⚠️ With no argument it prompts with a default pointing at the removed `../public/data/englishlistening/ltt1.json` — always pass the file path explicitly (e.g. a copy from `knowledgebuilder-content/englishlistening/`).

## `enwordjson2excel.py`

Converts a word-list JSON (array of `{ enword, cnword, ... }`) to an Excel workbook for review/printing. Requires `pandas` and `openpyxl`.

```
python tools/enwordjson2excel.py <words.json> [output.xlsx]
```

Without the second argument the output name is derived from the input file.

## `find_duplicates.py`

Scans a word-list JSON and reports duplicate `enword` entries with counts.

```
python tools/find_duplicates.py
```

⚠️ It prompts for a filename inside `../public/data/learnenglish/` (a directory that no longer exists). Run it against a content-repo copy by adjusting `file_path` in `main()`, or prefer the content repo's schema/validation scripts.

## `clean-cet6.js`

One-off cleanup of `qiaoji-cet6`: merges US/UK spelling variants (keeps the first occurrence, combines `cnwords`), fixes case-variant dead entries (Mercury, March, May, china), and reports size deltas. Reads/writes the removed `public/data/learnenglish/` path. ⚠️ Historical — kept for its variant-merging logic, not runnable as-is.

## Stale schema validation trio

`validate-schema.js`, `exercise-schema.json`, and `exercise-validation-report.md` target the removed `public/data/knowledge-exercises/`. Schema validation now lives entirely in `knowledgebuilder-content/util/` — see that repo's `util/how-to-use.md`. Do not extend these files.

## `another.py`

A 中国象棋 (Chinese chess) board/move implementation with no relation to this project (tracked by mistake). Delete unless it is intentionally kept.

## Data files in `tools/`

`1-01.json` … `2-06.json` are raw knowledge-exercise JSON kept for reference (canonical copies live in `knowledgebuilder-content/knowledge-exercises/`); `question.txt` / `questions.json` are `parse_questions` scratch inputs; `table.html` is a leftover sample. `.venv/` is a self-ignored local Python environment — never commit it.
