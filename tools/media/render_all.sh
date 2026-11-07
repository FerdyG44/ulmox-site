#!/bin/bash
# Re-render the landing-page media from the ULMOX App Store artwork.
#
#   tools/media/render_all.sh ~/projects/moment_app/store/screenshots/final_medium
#
# Needs python3 with Pillow + numpy, and ffmpeg with libx264.
# Writes assets/screens/<locale>/*.webp and assets/tour/<locale>.{mp4,jpg}.
set -euo pipefail
SRC=${1:?path to store/screenshots/final_medium}
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=$(cd "$HERE/../.." && pwd)/assets
mkdir -p "$OUT/tour" "$OUT/screens"

# site locale -> App Store artwork folder
PAIRS="en:en-US sv:sv tr:tr de:de-DE es:es-ES fr:fr-FR it:it pt:pt-BR nl:nl-NL pl:pl
fi:fi ru:ru ja:ja ko:ko zh:zh-Hans ar:ar-SA hi:hi th:th vi:vi el:el id:id ms:ms"

for pair in $PAIRS; do
  site=${pair%%:*}; store=${pair##*:}
  python3 "$HERE/crop_phones.py" "$SRC/$store" "$OUT/screens/$site" \
    01-daily-moments 02-world-live 03-share-moment 04-video-reactions 05-connections 08-global-discovery
  python3 "$HERE/make_tour.py" "$SRC/$store" "$OUT/tour/$site"
  echo "rendered $site"
done
