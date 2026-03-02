# JSONL Preview & .claude Reference

Quick reference for previewing Claude Code session `.jsonl` files and related setup.

---

## 1. Preview JSONL (Claude session transcripts)

Session files like `.claude/session-*-taskr-build.jsonl` are one JSON object per line. Use these methods to read them.

### A. jq (recommended)

```bash
# Pretty-print first record only
head -n 1 .claude/session-2026-03-01-taskr-build.jsonl | jq '.'

# Pretty-print first 3 records, separated
head -n 3 .claude/session-2026-03-01-taskr-build.jsonl | while read -r line; do echo "$line" | jq '.'; echo "---"; done

# Stream all records (paginated)
jq -R 'fromjson' --indent 2 .claude/session-2026-03-01-taskr-build.jsonl | less
```

### B. Python one-liner

```bash
python3 -c "
import json, sys
for i, line in enumerate(sys.stdin):
    if i >= 5: break
    print(json.dumps(json.loads(line), indent=2))
    print('---')
" < .claude/session-2026-03-01-taskr-build.jsonl
```

### C. VS Code / Cursor extension

Install **"JSON Lines"** or **"NDJSON"** for syntax highlighting and folding.

---

## .gitignore

Add `.claude/` to `.gitignore` so session data stays local (already done if present).
