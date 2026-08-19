#!/usr/bin/env bash
# Serve this page locally and open it.
#
# It has to be served over HTTP rather than opened as a file: the scene is an
# ES module, and a file:// origin is opaque, so the browser refuses the import
# and you get the static fallback ring instead of the garden.
#
#   ./serve.sh          # port 8080
#   ./serve.sh 9000     # some other port
set -euo pipefail

PORT="${1:-8080}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL="http://127.0.0.1:${PORT}/"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Any static server works, for example:" >&2
  echo "  npx --yes serve -l ${PORT} \"${DIR}\"" >&2
  exit 1
fi

echo "Serving ${DIR}"
echo "  ${URL}"
echo "  ${URL}?quality=high   pin the top quality tier"
echo "  ${URL}?quality=off    skip the 3D scene entirely"
echo "Ctrl-C to stop."

# Open once the server is actually accepting connections, rather than after a
# fixed sleep that is either too short or wasted.
( for _ in $(seq 1 50); do
    if curl -fsS -o /dev/null "${URL}" 2>/dev/null; then
      if command -v open >/dev/null 2>&1; then open "${URL}"
      elif command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}"
      fi
      break
    fi
    sleep 0.2
  done ) &

exec python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${DIR}"
