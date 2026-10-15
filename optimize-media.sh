#!/usr/bin/env bash
# Run inside the folder that holds your .mp4 and .jpg files. Needs ffmpeg (brew install ffmpeg / winget install ffmpeg).
# Originals are copied to ./originals/ first, and a file is only replaced when the new one is actually smaller.
#
# VIDEOS (picture quality unchanged)
#   - moves the mp4 index to the front ("faststart") so playback and the first frame start immediately.
#     This is the main reason a video stays black for seconds: without it the browser needs the END of the file first.
#   - removes the audio track (videos are muted anyway)
#   - makes <name>-poster.jpg, the still shown instantly while the video loads
#   - not H.264 (e.g. HEVC from a phone/screen recorder), or --shrink and bigger than 15 MB: re-encoded at CRF 18 (visually lossless), max 1920 wide
# PICTURES
#   - any jpg wider than 1600px or bigger than 400 KB is resized to 1600px wide at high quality (cards are shown at ~600-1100px, so this is sharp even on retina)
#   - same file names, so index.html needs no change
set -euo pipefail
SHRINK=0; [[ "${1:-}" == "--shrink" ]] && SHRINK=1
mkdir -p originals
fsize() { stat -c%s "$1" 2>/dev/null || stat -f%z "$1"; }

for f in *.mp4; do
  [[ -e "$f" ]] || continue
  [[ -f "originals/$f" ]] || cp "$f" "originals/$f"
  src="originals/$f"; tmp="tmp_$f"
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src")
  size=$(fsize "$src")
  if [[ "$codec" != "h264" ]] || { [[ $SHRINK == 1 ]] && (( size > 15000000 )); }; then
    echo "video  $f: re-encode ($codec, $((size/1000000)) MB)"
    ffmpeg -y -loglevel error -i "$src" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -preset slow -crf 18 \
           -pix_fmt yuv420p -profile:v high -movflags +faststart "$tmp"
  else
    echo "video  $f: lossless faststart ($((size/1000000)) MB)"
    ffmpeg -y -loglevel error -i "$src" -an -c:v copy -movflags +faststart "$tmp"
  fi
  mv "$tmp" "$f"
  ffmpeg -y -loglevel error -ss 0.1 -i "$f" -frames:v 1 -vf "scale='min(1280,iw)':-2" -q:v 3 "${f%.mp4}-poster.jpg"
done

for f in *.jpg *.jpeg; do
  [[ -e "$f" ]] || continue
  [[ "$f" == *-poster.jpg ]] && continue
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$f")
  size=$(fsize "$f")
  if (( w > 1600 || size > 400000 )); then
    [[ -f "originals/$f" ]] || cp "$f" "originals/$f"
    ffmpeg -y -loglevel error -i "originals/$f" -vf "scale='min(1600,iw)':-2:flags=lanczos" -map_metadata -1 -q:v 3 "tmp_$f"
    if (( $(fsize "tmp_$f") < size )); then mv "tmp_$f" "$f"; echo "image  $f: $((size/1000)) KB -> $(( $(fsize "$f")/1000 )) KB"
    else rm "tmp_$f"; echo "image  $f: already small, kept"; fi
  fi
done
echo "Done. Upload the .mp4, *-poster.jpg and .jpg files next to index.html."
