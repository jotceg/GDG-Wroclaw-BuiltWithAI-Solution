#!/usr/bin/env bash
#
# start-dev.sh — launch the whole local stack for team Kakapos.
#
#   MCP server   (Python / FastMCP + pytriz)   http://localhost:8123   (/mcp + /tools)
#   Backend      (NestJS)                       http://localhost:3000/api
#   Frontend     (Angular dev-server)           http://localhost:4200
#   Ollama       (optional local LLM)           http://localhost:11434
#
# Usage:
#   ./start-dev.sh                 # start MCP + backend + frontend
#   ./start-dev.sh --with-ollama   # also start `ollama serve` if not already running
#   ./start-dev.sh --help
#
# Ctrl+C stops everything this script started (each service runs in its own
# process group, so children — webpack, node, uvicorn — are cleaned up too).
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

LOG_DIR="$ROOT/.dev-logs"
mkdir -p "$LOG_DIR"

WITH_OLLAMA=0
for arg in "$@"; do
  case "$arg" in
    -o|--with-ollama) WITH_OLLAMA=1 ;;
    -h|--help)
      awk 'NR==1{next} /^#/{sub(/^# ?/,""); print; next} {exit}' "${BASH_SOURCE[0]}"
      exit 0 ;;
    *) echo "Unknown option: $arg (try --help)"; exit 2 ;;
  esac
done

# --- pretty prefixed output -------------------------------------------------
c_reset=$'\033[0m'; c_mcp=$'\033[35m'; c_be=$'\033[36m'; c_fe=$'\033[32m'; c_ol=$'\033[33m'; c_sys=$'\033[1m'
say() { printf '%s[dev]%s %s\n' "$c_sys" "$c_reset" "$*"; }

PGIDS=()  # process-group ids to tear down

# start <name> <color> <logfile> <command...>
start() {
  local name="$1" color="$2" logfile="$3"; shift 3
  say "starting ${color}${name}${c_reset} → $logfile"
  # setsid → own process group so we can kill the whole subtree on exit.
  setsid bash -c "$*" >"$logfile" 2>&1 &
  local pid=$!
  PGIDS+=("$pid")
  # tee the log to the console with a colored prefix, in the background.
  ( tail -n +1 -F "$logfile" 2>/dev/null | sed -u "s/^/${color}[${name}]${c_reset} /" ) &
  PGIDS+=("$!")
}

cleanup() {
  echo
  say "shutting down…"
  for pid in "${PGIDS[@]}"; do
    kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  say "stopped."
}
trap cleanup INT TERM EXIT

port_open() { (exec 3<>/dev/tcp/localhost/"$1") 2>/dev/null && exec 3<&- && return 0 || return 1; }

wait_port() { # port name timeout_s
  local port="$1" name="$2" timeout="${3:-60}" i=0
  while ! port_open "$port"; do
    i=$((i+1)); [ "$i" -ge "$timeout" ] && { say "⚠ $name not up on :$port after ${timeout}s (check $LOG_DIR)"; return 1; }
    sleep 1
  done
  say "✓ $name ready on :$port"
}

# --- prerequisites ----------------------------------------------------------
command -v uv  >/dev/null || { say "✗ 'uv' not found — needed for the MCP server"; exit 1; }
command -v npx >/dev/null || { say "✗ 'npx' not found — needed for nx"; exit 1; }
port_open 5432 || say "⚠ Postgres not detected on :5432 — the backend needs it (see root .env)."

# --- optional: Ollama -------------------------------------------------------
if [ "$WITH_OLLAMA" = 1 ]; then
  if port_open 11434; then
    say "Ollama already running on :11434 — reusing it."
  elif command -v ollama >/dev/null; then
    start "ollama" "$c_ol" "$LOG_DIR/ollama.log" "exec ollama serve"
    wait_port 11434 "ollama" 30 || true
  else
    say "⚠ --with-ollama given but 'ollama' is not installed; skipping."
  fi
fi

# --- MCP server (start first; backend can call its tools) -------------------
start "mcp" "$c_mcp" "$LOG_DIR/mcp.log" "cd '$ROOT/apps/mcp-server' && exec uv run python app/main.py"
wait_port 8123 "mcp" 60 || true

# --- Backend ----------------------------------------------------------------
start "backend" "$c_be" "$LOG_DIR/backend.log" "exec npx nx serve backend"
wait_port 3000 "backend" 120 || true

# --- Frontend ---------------------------------------------------------------
start "frontend" "$c_fe" "$LOG_DIR/frontend.log" "exec npx nx serve frontend"
wait_port 4200 "frontend" 120 || true

say "─────────────────────────────────────────────"
say "MCP      http://localhost:8123/mcp"
say "Backend  http://localhost:3000/api"
say "Frontend http://localhost:4200"
[ "$WITH_OLLAMA" = 1 ] && say "Ollama   http://localhost:11434"
say "Logs in $LOG_DIR — press Ctrl+C to stop everything."
say "─────────────────────────────────────────────"

# Keep running until interrupted; if any service process group dies, keep the
# others up (developer can read the log) until Ctrl+C.
wait
