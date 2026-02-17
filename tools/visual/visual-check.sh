#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
if [[ -z "$MODE" ]]; then
  echo "Usage: $0 <baseline|current|compare|all>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASE_DIR="$ROOT_DIR/visual-baseline/baseline"
CURR_DIR="$ROOT_DIR/visual-baseline/current"
DIFF_DIR="$ROOT_DIR/visual-baseline/diff"
TMP_DIR="$ROOT_DIR/visual-baseline/.tmp"

SECTIONS=(
  "top:home"
  "story:our-story"
  "stay:where-to-stay"
  "things-to-do:things-to-do"
  "makan:beijing-food-menu"
  "travel-visa:travel-visa"
  "rsvp:rsvp"
  "gallery:recent-moments"
)

BPS=(
  "mobile:390:844"
  "tablet:834:1112"
  "desktop:1440:900"
)

PLAYWRIGHT_CMD=(npx -y playwright@1.51.1)
ODIFF_CMD=(npx -y odiff-bin)
SERVER_PORT="${VISUAL_SERVER_PORT:-3100}"
SERVER_URL="${VISUAL_SERVER_URL:-http://127.0.0.1:${SERVER_PORT}}"
CAPTURE_WAIT_MS="${VISUAL_CAPTURE_WAIT_MS:-2600}"

ensure_browser() {
  "${PLAYWRIGHT_CMD[@]}" install chromium >/dev/null
}

start_server() {
  mkdir -p "$TMP_DIR"
  pushd "$ROOT_DIR" >/dev/null
  PORT="$SERVER_PORT" node server.js >"$TMP_DIR/server.log" 2>&1 &
  SERVER_PID=$!
  popd >/dev/null
  for _ in {1..60}; do
    if curl -sSf "$SERVER_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done
  echo "Server failed to start. See $TMP_DIR/server.log"
  exit 1
}

stop_server() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

capture_set() {
  local out_root="$1"
  mkdir -p "$out_root"

  for bp in "${BPS[@]}"; do
    IFS=':' read -r bp_name width height <<<"$bp"
    mkdir -p "$out_root/$bp_name"

    for sec in "${SECTIONS[@]}"; do
      IFS=':' read -r anchor name <<<"$sec"
      local out_file="$out_root/$bp_name/${name}.png"
      local url="${SERVER_URL}/#${anchor}"
      echo "[capture] $bp_name/$name"
      "${PLAYWRIGHT_CMD[@]}" screenshot \
        --browser chromium \
        --viewport-size "${width},${height}" \
        --wait-for-timeout "$CAPTURE_WAIT_MS" \
        "$url" "$out_file" >/dev/null
    done
  done
}

compare_sets() {
  local failures=0
  mkdir -p "$DIFF_DIR"

  for bp in "${BPS[@]}"; do
    IFS=':' read -r bp_name _ _ <<<"$bp"
    mkdir -p "$DIFF_DIR/$bp_name"

    for sec in "${SECTIONS[@]}"; do
      IFS=':' read -r _ name <<<"$sec"
      local base_file="$BASE_DIR/$bp_name/${name}.png"
      local curr_file="$CURR_DIR/$bp_name/${name}.png"
      local diff_file="$DIFF_DIR/$bp_name/${name}.png"

      if [[ ! -f "$base_file" || ! -f "$curr_file" ]]; then
        echo "[compare] MISSING $bp_name/$name"
        failures=$((failures + 1))
        continue
      fi

      if "${ODIFF_CMD[@]}" "$base_file" "$curr_file" "$diff_file" >/dev/null 2>&1; then
        rm -f "$diff_file"
        echo "[compare] PASS $bp_name/$name"
      else
        echo "[compare] DIFF $bp_name/$name"
        failures=$((failures + 1))
      fi
    done
  done

  if (( failures > 0 )); then
    echo "Visual diff result: FAIL (${failures} differences)"
    return 1
  fi

  echo "Visual diff result: PASS (0 differences)"
  return 0
}

case "$MODE" in
  baseline)
    ensure_browser
    start_server
    trap stop_server EXIT
    capture_set "$BASE_DIR"
    ;;
  current)
    ensure_browser
    start_server
    trap stop_server EXIT
    capture_set "$CURR_DIR"
    ;;
  compare)
    compare_sets
    ;;
  all)
    ensure_browser
    start_server
    trap stop_server EXIT
    capture_set "$CURR_DIR"
    stop_server
    compare_sets
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: $0 <baseline|current|compare|all>"
    exit 1
    ;;
esac
