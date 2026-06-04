#!/usr/bin/env bash
# Upload a media file to Wavespeed and print the download URL.
#
# Usage:
#   ./upload_media.sh <file-path>
#
# Requires WAVESPEED_API_KEY env var or pass via --api-key <key>
#
# Example:
#   WAVESPEED_API_KEY=abc ./upload_media.sh ./frame.png

set -euo pipefail

FILE_PATH=""
API_KEY="${WAVESPEED_API_KEY:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-key) API_KEY="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: upload_media.sh [--api-key <key>] <file-path>"
      exit 0 ;;
    *) FILE_PATH="$1"; shift ;;
  esac
done

if [[ -z "$API_KEY" ]]; then
  echo "Error: WAVESPEED_API_KEY required (env or --api-key)" >&2
  exit 1
fi

if [[ -z "$FILE_PATH" ]]; then
  echo "Error: file path required" >&2
  exit 1
fi

if [[ ! -f "$FILE_PATH" ]]; then
  echo "Error: file not found: $FILE_PATH" >&2
  exit 1
fi

echo "Uploading: $FILE_PATH" >&2
RESPONSE=$(curl -s -X POST "https://api.wavespeed.ai/api/v3/media/upload/binary" \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@$FILE_PATH")

echo "$RESPONSE" >&2

DOWNLOAD_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['download_url'])" 2>/dev/null || true)

if [[ -z "$DOWNLOAD_URL" ]]; then
  echo "Error: failed to extract download URL from response" >&2
  exit 1
fi

echo "$DOWNLOAD_URL"
