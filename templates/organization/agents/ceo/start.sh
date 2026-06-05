#!/bin/bash
# Launch the CEO agent interactively with pi (loads habits + org context via the wake extension).
# Requires the pi runtime. For Claude Code, just run `claude` in this directory — it reads CLAUDE.md.
pi -e ../../shared/extensions/interactive.ts
