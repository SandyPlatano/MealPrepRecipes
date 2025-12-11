#!/bin/bash

COUNTER_FILE="$CLAUDE_PROJECT_DIR/.claude/commit-counter"

# Read current count
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
else
  COUNT=0
fi

# Increment count
COUNT=$((COUNT + 1))

# Every 2 chats, commit
if [ $((COUNT % 2)) -eq 0 ]; then
  cd "$CLAUDE_PROJECT_DIR"

  # Check if there are changes to commit
  if ! git diff-index --quiet HEAD --; then
    git add -A
    git commit -m "Auto-commit after 2 chats - $(date '+%Y-%m-%d %H:%M:%S')"
  fi

  # Reset counter
  COUNT=0
fi

# Save updated count
echo "$COUNT" > "$COUNTER_FILE"

exit 0
