#!/usr/bin/env bash
# Run inside the folder with your .mp4 and .jpg files (index.html and about.html folder).
# Needs ffmpeg:  brew install ffmpeg   (Mac)   |   winget install ffmpeg   (Windows)
#
#   ./optimize-media.sh              normal: web-optimized videos (looks the same at the size shown on the site)
#   ./optimize-media.sh --lossless   keeps the main videos' picture bit-for-bit (only moves the index to the front); lighter phone files are still made
#
# Originals are copied to ./originals/ first and are never overwritten; running it again is safe.
#
# VIDEOS  (every name.mp4 becomes TWO files + a poster)
#   name.mp4         desktop: max 1920 px on the long side, H.264, quality CRF 21 (visually lossless), faststart, no audio
#   name-m.mp4       phones + iPad: max 1280 px, CRF 24, faststart, no audio  (index.html/about.html pick it automatically)
#   name-poster.jpg  the still image shown instantly while the video loads
#   "faststart" puts the mp4 index at the front, so the first frame can show before the file has finished downloading.
#   If your original is already smaller than the new one, it is kept as is (only faststart is added).
# PICTURES
#   any jpg wider than 1600 px or bigger than 400 KB -> 1600 px wide, high quality, same file name (no HTML change needed)
set -euo pipefail
LOSSLESS=0; [[ "${1:-}" == "--lossless" ]] && LOSSLESS=1
mkdir -p originals
fsize() { stat -c%s "$1" 2>/dev/null || stat -f%z "$1"; }
# scale so the LONG side is at most $1 px (works for landscape and portrait), keep even dimensions
fit() { echo "scale='if(gt(iw,ih),min($1,iw),-2)':'if(gt(iw,ih),-2,min($1,ih))':flags=lanczos"; }
enc() { # in out maxside crf
  ffmpeg -y -loglevel error -i "$1" -an -vf "$(fit "$3")" -c:v libx264 -preset slow -crf "$4" \
         -pix_fmt yuv420p -profile:v high -level 4.1 -tag:v avc1 -g 60 -movflags +faststart "$2"
}

for f in *.mp4; do
  [[ -e "$f" ]] || continue
  [[ "$f" == *-m.mp4 ]] && continue
  [[ -f "originals/$f" ]] || cp "$f" "originals/$f"
  src="originals/$f"; size=$(fsize "$src"); base="${f%.mp4}"
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src")

  # desktop file
  if [[ $LOSSLESS == 1 && "$codec" == "h264" ]]; then
    ffmpeg -y -loglevel error -i "$src" -an -c:v copy -movflags +faststart "tmp_$f"; how="lossless faststart"
  else
    enc "$src" "tmp_$f" 1920 21; how="web quality"
    if [[ "$codec" == "h264" ]] && (( $(fsize "tmp_$f") >= size )); then
      ffmpeg -y -loglevel error -i "$src" -an -c:v copy -movflags +faststart "tmp_$f"; how="already small: faststart only"
    fi
  fi
  mv "tmp_$f" "$f"
  echo "video  $f: $((size/1000)) KB -> $(( $(fsize "$f")/1000 )) KB ($how)"

  # phone + iPad file
  enc "$src" "tmp_$base-m.mp4" 1280 24 && mv "tmp_$base-m.mp4" "$base-m.mp4"
  echo "video  $base-m.mp4: $(( $(fsize "$base-m.mp4")/1000 )) KB (phones + iPad)"

  # poster = first frame
  ffmpeg -y -loglevel error -ss 0.1 -i "$f" -frames:v 1 -vf "$(fit 1280)" -q:v 3 "$base-poster.jpg"
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
echo "Done. Upload ALL new .mp4 (including the -m ones), *-poster.jpg and .jpg files next to index.html and about.html."
