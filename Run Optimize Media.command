#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

/bin/bash "$SCRIPT_DIR/optimize-media.sh" "$@"
STATUS=$?

printf '\nOptimization finished with exit code %s.\n' "$STATUS"
read -r -p 'Press Return to close this window...' _
exit "$STATUS"
