import argparse
import json
import os
import re
import sys
from pathlib import Path

def err(msg, code=1):
    print(f"Error: {msg}", file=sys.stderr)
    sys.exit(code)

def warn(msg):
    print(f"Warning: {msg}", file=sys.stderr)

def sanitize_filename(name: str, fallback: str) -> str:
    # Replace unacceptable characters with underscores; keep alnum, dot, underscore, hyphen.
    cleaned = re.sub(r'[^A-Za-z0-9._-]+', '_', name).strip("._-")
    return cleaned if cleaned else fallback

def ensure_unique_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    i = 1
    while True:
        cand = parent / f"{stem}_{i}{suffix}"
        if not cand.exists():
            return cand
        i += 1

def parse_millis(value, idx, field):
    # Accept integers or floats that are whole numbers; reject others.
    if isinstance(value, bool):
        raise ValueError(f"Rule #{idx}: {field} cannot be boolean")
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    # Try string that looks like an int
    try:
        sv = str(value).strip()
        if sv.isdigit() or (sv.startswith('-') and sv[1:].isdigit()):
            return int(sv)
    except Exception:
        pass
    raise ValueError(f"Rule #{idx}: {field} must be an integer number of milliseconds")

def load_rules_strict(json_path: Path):
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        err(f"Failed to read JSON: {e}")

    if not isinstance(data, list):
        err("JSON root must be a list of rules")

    rules = []
    errors = []
    for idx, item in enumerate(data):
        ctx = f"Rule #{idx}"
        if not isinstance(item, dict):
            errors.append(f"{ctx} is not an object")
            continue
        # Required fields
        if "id" not in item:
            errors.append(f"{ctx} missing 'id'")
            continue
        if "startTime" not in item:
            errors.append(f"{ctx} missing 'startTime'")
            continue
        if "endTime" not in item:
            errors.append(f"{ctx} missing 'endTime'")
            continue

        rid = str(item["id"])
        try:
            start = parse_millis(item["startTime"], idx, "startTime")
            end = parse_millis(item["endTime"], idx, "endTime")
        except ValueError as ve:
            errors.append(str(ve))
            continue

        rules.append({"id": rid, "start": start, "end": end})

    if errors:
        err("Invalid rules in JSON:\n" + "\n".join(f" - {e}" for e in errors))
    if not rules:
        err("No valid rules found in JSON")
    return rules

def enforce_prerequisites(rules, audio_len_ms: int):
    errors = []

    # Check unique ids
    seen_ids = {}
    for i, r in enumerate(rules):
        rid = r["id"]
        if rid in seen_ids:
            errors.append(f"Duplicate id '{rid}' (first at rule #{seen_ids[rid]}, again at rule #{i})")
        else:
            seen_ids[rid] = i

    # Check time ranges
    for i, r in enumerate(rules):
        s, e = r["start"], r["end"]
        if s < 0 or e < 0:
            errors.append(f"Rule #{i} ('{r['id']}'): times must be non-negative (got start={s}, end={e})")
        if s >= e:
            errors.append(f"Rule #{i} ('{r['id']}'): startTime must be less than endTime (got start={s}, end={e})")
        if s > audio_len_ms or e > audio_len_ms:
            errors.append(f"Rule #{i} ('{r['id']}'): times must be within audio length (0..{audio_len_ms} ms); got start={s}, end={e}")

    if errors:
        err("Prerequisite checks failed:\n" + "\n".join(f" - {e}" for e in errors))

def check_dependencies():
    try:
        from pydub import AudioSegment  # noqa: F401
        from pydub.utils import which
    except ImportError:
        err("Missing dependency 'pydub'. Install with: pip install pydub")
    from pydub.utils import which
    if which("ffmpeg") is None and which("ffplay") is None and which("ffprobe") is None:
        warn("ffmpeg not found on PATH. pydub requires ffmpeg to read/export MP3s.")
        warn("Install ffmpeg and ensure it is on PATH (e.g., brew install ffmpeg, sudo apt-get install ffmpeg, or Windows installer).")
    return True

def split_mp3(mp3_path: Path, rules_path: Path, outdir: Path, overwrite: bool, bitrate: str = "128k"):
    check_dependencies()
    from pydub import AudioSegment

    if not mp3_path.exists():
        err(f"Input MP3 not found: {mp3_path}")
    if not rules_path.exists():
        err(f"Rules JSON not found: {rules_path}")

    outdir.mkdir(parents=True, exist_ok=True)
    rules = load_rules_strict(rules_path)

    try:
        audio = AudioSegment.from_file(str(mp3_path))
    except Exception as e:
        err(f"Failed to load MP3: {e}")

    audio_len_ms = len(audio)
    # Enforce prerequisites strictly
    enforce_prerequisites(rules, audio_len_ms)

    print(f"Loaded {mp3_path.name} ({audio_len_ms} ms). Processing {len(rules)} rule(s)...")

    success = 0
    for i, rule in enumerate(rules, start=1):
        rid = sanitize_filename(rule["id"], fallback=f"segment_{i}")
        start = rule["start"]
        end = rule["end"]

        # With prerequisites enforced, times are valid; no clamping needed.
        segment = audio[start:end]
        out_path = outdir / f"{rid}.mp3"
        if out_path.exists() and not overwrite:
            out_path = ensure_unique_path(out_path)

        try:
            segment.export(str(out_path), format="mp3", bitrate=bitrate, tags={"title": rid})
            print(f"Saved: {out_path.name} [{start} ms - {end} ms]")
            success += 1
        except Exception as e:
            warn(f"[{rid}] Failed to export: {e}")

    print(f"Done. {success}/{len(rules)} segments created in: {outdir}")

def main():
    parser = argparse.ArgumentParser(description="Split an MP3 file into multiple parts based on JSON rules.")
    parser.add_argument("mp3", help="Path to input MP3 file")
    parser.add_argument("rules", help="Path to JSON file with split rules")
    parser.add_argument("--outdir", default="output_segments", help="Directory to write output MP3s (default: output_segments)")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing files (default: append numeric suffix)")
    parser.add_argument("--bitrate", default="128k", help="Output MP3 bitrate (e.g., 128k, 192k). Default: 128k")
    args = parser.parse_args()

    mp3_path = Path(args.mp3)
    rules_path = Path(args.rules)
    outdir = Path(args.outdir)

    split_mp3(mp3_path, rules_path, outdir, overwrite=args.overwrite, bitrate=args.bitrate)

if __name__ == "__main__":
    main()