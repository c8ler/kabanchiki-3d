#!/usr/bin/env bash
set -euo pipefail
mkdir -p screenshots
python3 -m http.server 8765 >/tmp/kabanchiki-http.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1
CHROME="${CHROME_BIN:-$(command -v chromium || command -v chromium-browser || command -v google-chrome)}"
test -n "$CHROME"
for LV in 1 2 3 4 5; do
  "$CHROME" --headless --no-sandbox --disable-dev-shm-usage --hide-scrollbars \
    --window-size=1280,720 --virtual-time-budget=5000 \
    --screenshot="screenshots/location-${LV}.png" \
    "http://127.0.0.1:8765/index.html?autotest=1&level=${LV}"
  test -s "screenshots/location-${LV}.png"
done
echo "✓ 5 visual smoke screenshots created"
