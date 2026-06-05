#!/usr/bin/env python3
"""
zero-human-init generator.

Stamps the templates/ tree into a new project directory, replacing {{PLACEHOLDERS}}
with the values provided in a JSON config.

Usage:
    python3 generate.py config.json
    cat config.json | python3 generate.py -

config.json shape:
{
  "target_dir": "/abs/path/to/new-project",   # required
  "values": {
    "COMPANY_NAME": "...",
    "COMPANY_SLUG": "...",
    "ONE_LINER": "...",
    "WHAT_WE_DO": "...",
    "MISSION": "...",
    "VISION": "...",
    "HUMAN_FOUNDER": "...",
    "CEO_PERSONALITY": "...",
    "WHAT_DRIVES_CEO": "...",
    "LANGUAGE": "English",
    "CEO_MODEL_CLAUDE": "claude-sonnet-4-6",
    "DATE": "2026-06-05"
  }
}
PROJECT_ROOT is injected automatically (= absolute target_dir).
"""
import json
import os
import re
import shutil
import stat
import sys

REQUIRED = [
    "COMPANY_NAME", "COMPANY_SLUG", "ONE_LINER", "WHAT_WE_DO", "MISSION",
    "VISION", "HUMAN_FOUNDER", "CEO_PERSONALITY", "WHAT_DRIVES_CEO",
    "LANGUAGE", "CEO_MODEL_CLAUDE", "DATE", "DRAFT_NOTICE",
]

HERE = os.path.dirname(os.path.abspath(__file__))


def _find_templates(start):
    """Walk up from `start` until we find a dir containing templates/organization."""
    cur = start
    while True:
        candidate = os.path.join(cur, "templates")
        if os.path.isdir(os.path.join(candidate, "organization")):
            return candidate
        parent = os.path.dirname(cur)
        if parent == cur:  # reached filesystem root
            return os.path.join(start, "templates")  # fallback (errors clearly later)
        cur = parent


TEMPLATES = _find_templates(HERE)


def load_config(arg):
    raw = sys.stdin.read() if arg == "-" else open(arg, encoding="utf-8").read()
    return json.loads(raw)


def substitute(text, values):
    def repl(m):
        key = m.group(1)
        if key not in values:
            raise KeyError(f"Unknown placeholder {{{{{key}}}}}")
        return values[key]
    return re.sub(r"\{\{(\w+)\}\}", repl, text)


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: generate.py <config.json|->")
    cfg = load_config(sys.argv[1])

    target = os.path.abspath(os.path.expanduser(cfg["target_dir"]))
    values = dict(cfg.get("values", {}))
    values["PROJECT_ROOT"] = target

    missing = [k for k in REQUIRED if k not in values]
    if missing:
        sys.exit(f"missing required values: {', '.join(missing)}")

    src_org = os.path.join(TEMPLATES, "organization")
    if not os.path.isdir(src_org):
        sys.exit(f"templates not found at {src_org}")

    if os.path.exists(target) and os.listdir(target):
        sys.exit(f"target dir is not empty: {target}")

    created = 0
    for root, _dirs, files in os.walk(src_org):
        rel = os.path.relpath(root, TEMPLATES)
        dest_dir = os.path.join(target, rel)
        os.makedirs(dest_dir, exist_ok=True)
        for fn in files:
            src = os.path.join(root, fn)
            # rename the kickoff message to use the real date
            out_fn = fn
            if fn.endswith("-founder-kickoff.md"):
                out_fn = f"{values['DATE']}-0000-founder-kickoff.md"
            dest = os.path.join(dest_dir, out_fn)
            with open(src, encoding="utf-8") as f:
                content = f.read()
            content = substitute(content, values)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
            # preserve executable bit (start.sh)
            if os.access(src, os.X_OK):
                st = os.stat(dest)
                os.chmod(dest, st.st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
            created += 1

    print(f"Generated {created} files into {target}")


if __name__ == "__main__":
    main()
