#!/bin/bash

# Auto-healing dev server monitor for MealPrepRecipes
# Checks localhost:3001 every 10 seconds, auto-restarts if down
# Auto-clears .next cache after consecutive failures (cache corruption fix)

PORT=3001
CHECK_INTERVAL=10
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
FAIL_COUNT=0
CLEAN_THRESHOLD=2  # Clear cache after this many consecutive failures

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

clean_cache() {
  log "🧹 Clearing .next cache (suspected corruption)..."
  rm -rf "$PROJECT_DIR/.next"
}

start_server() {
  log "🚀 Starting dev server..."
  cd "$PROJECT_DIR"
  npm run dev > /dev/null 2>&1 &
  sleep 5  # Give it time to start
}

kill_server() {
  local pid=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$pid" ]; then
    log "🔪 Killing stuck process on port $PORT (PID: $pid)"
    kill -9 $pid 2>/dev/null
    sleep 2
  fi
}

check_server() {
  curl -s --max-time 5 "http://localhost:$PORT" > /dev/null 2>&1
  return $?
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔍 Dev Monitor Started (port $PORT)"
log "   Cache auto-clean after $CLEAN_THRESHOLD failures"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Initial check - start if not running
if ! check_server; then
  start_server
fi

# Main monitoring loop
while true; do
  if ! check_server; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
    log "⚠️  Server not responding! (failure #$FAIL_COUNT)"

    kill_server

    # Clear cache after consecutive failures (likely cache corruption)
    if [ $FAIL_COUNT -ge $CLEAN_THRESHOLD ]; then
      clean_cache
      FAIL_COUNT=0
    fi

    start_server

    if check_server; then
      log "✅ Server recovered!"
      FAIL_COUNT=0
    else
      log "❌ Server failed to start - retrying in ${CHECK_INTERVAL}s"
    fi
  else
    # Reset fail count on successful check
    if [ $FAIL_COUNT -gt 0 ]; then
      FAIL_COUNT=0
    fi
  fi
  sleep $CHECK_INTERVAL
done
