#!/usr/bin/env bash
# Run this inside the folder that contains your .mp4 files (needs ffmpeg: brew install ffmpeg / winget install ffmpeg)
# What it does, WITHOUT touching picture quality:
#   1. moves the "moov" index of every mp4 to the front (faststart) so playback can begin before the download ends.
#      This is the usual cause of videos sitting black for ~10s.
#   2. drops the audio track (the videos are muted anyway, so it is wasted download size)
#   3. makes <name>-poster.jpg from the first frame, which the site shows instead of black while the video loads
# Originals are kept in ./originals/
# Optional: ./optimize-videos.sh --shrink  re-encodes with CRF 18 (visually lossless) for files bigger than ~15 MB.
set -euo pipefail
SHRINK=0; [[ "${1:-}" == "--shrink" ]] && SHRINK=1
mkdir -p originals
for f in *.mp4; do
  [[ -e "$f" ]] || continue
  [[ -f "originals/$f" ]] || cp "$f" "originals/$f"
  src="originals/$f"; tmp="tmp_$f"
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src")
  size=$(stat -c%s "$src" 2>/dev/null || stat -f%z "$src")
  if [[ "$codec" != "h264" ]] || { [[ $SHRINK == 1 ]] && (( size > 15000000 )); }; then
    echo "re-encoding $f ($codec, $((size/1000000)) MB) -> h264 CRF 18"
    ffmpeg -y -loglevel error -i "$src" -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high \
           -g 60 -movflags +faststart "$tmp"
  else
    echo "lossless remux $f ($((size/1000000)) MB)"
    ffmpeg -y -loglevel error -i "$src" -an -c:v copy -movflags +faststart "$tmp"
  fi
  mv "$tmp" "$f"
  ffmpeg -y -loglevel error -ss 0.1 -i "$f" -frames:v 1 -q:v 2 "${f%.mp4}-poster.jpg"
done
echo "done. Upload the new .mp4 files AND the *-poster.jpg files next to index.html."
