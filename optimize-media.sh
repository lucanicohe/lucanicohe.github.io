#!/usr/bin/env bash
# Run inside the folder with your .mp4 and .jpg files (the index.html folder).
# Needs ffmpeg:  brew install ffmpeg   (Mac)   |   winget install ffmpeg   (Windows)
#
#   ./optimize-media.sh                      normal: web-optimized videos (looks the same at the size shown on the site)
#   ./optimize-media.sh --max-seconds 12     same, but also cuts every video to its first 12 s (the biggest saver for long clips)
#   ./optimize-media.sh --lossless           keeps the main videos' picture bit-for-bit (only moves the index to the front); phone files are still made
#
# Originals are copied to ./originals/ first; running it again is safe.
# The script remembers what it already optimized (.optimize-state), so a second run skips finished files and only
# processes NEW or REPLACED ones (put a new video with the same name in the folder and only that one is redone).
#   ./optimize-media.sh --mark-done  one time only: tell the script that everything already in the folder is optimized (no encoding)
#   ./optimize-media.sh --redo artwork.mp4   you replaced this file with a NEW version: treat the file in the folder as the new original and redo it
#   ./optimize-media.sh --refresh    rebuild ALL -m.mp4 and -poster.jpg from the videos currently in the folder (no re-optimizing of the main videos)
#                                    (also happens automatically on a normal run for any video that is newer than its -m / poster)
#   ./optimize-media.sh --force    redo everything again from ./originals/ (e.g. after changing --max-seconds)
#
# WHY THESE SETTINGS (the site shows each video at most 1200 px wide, muted, looping)
#   - 30 fps max: screen recordings are often 60 fps, which costs about 40% more bytes and nobody sees it in a looping clip
#   - 1600 px max on desktop (was 1920): the video box is 1200 px wide, so 1920 was extra bytes
#   - capped quality (CRF + maxrate): quality stays constant, but busy scenes can no longer spike to huge bitrates,
#     which is what makes a video stall while buffering
#   - no audio, faststart (first frame shows before the file finished downloading)
#
# VIDEOS  (every name.mp4 becomes TWO files + a poster)
#   name.mp4         desktop: max 1600 px, H.264, CRF 23, max 3.5 Mbit/s
#   name-m.mp4       phones + iPad: max 1280 px, CRF 26, max 1.6 Mbit/s (index.html picks it automatically)
#   name-poster.jpg  the still image shown instantly while the video loads (kept small)
# PICTURES
#   any jpg wider than 1600 px or bigger than 300 KB -> 1600 px wide, high quality, same file name (no HTML change needed)
set -euo pipefail
LOSSLESS=0; TRIM=0; FORCE=0; MARK=0; REFRESH=0; REDO=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lossless) LOSSLESS=1 ;;
    --force) FORCE=1 ;;
    --refresh) REFRESH=1 ;;
    --mark-done) MARK=1 ;;
    --redo) REDO="$REDO|${2:?--redo needs a file name}|"; shift ;;
    --max-seconds) TRIM="${2:?--max-seconds needs a number}"; shift ;;
    --max-seconds=*) TRIM="${1#*=}" ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done
TFLAG=""; if [[ "$TRIM" != "0" ]]; then TFLAG="-t $TRIM"; fi

mkdir -p originals
# leftovers of an interrupted run (Ctrl+C) must never be treated as real files
find . -maxdepth 1 -name 'tmp_*' -delete 2>/dev/null || true
fsize() { stat -c%s "$1" 2>/dev/null || stat -f%z "$1"; }
STATE=".optimize-state"; touch "$STATE"
recorded() { awk -F'\t' -v n="$1" '$1==n{print $2}' "$STATE"; }
record() { awk -F'\t' -v n="$1" '$1!=n' "$STATE" > "$STATE.tmp"; printf '%s\t%s\n' "$1" "$2" >> "$STATE.tmp"; mv "$STATE.tmp" "$STATE"; }
# keep ./originals/ in sync: copy when missing, and replace it when the file in the folder is a NEW version of an earlier one
sync_original() { # file key currentsize
  local rec; rec=$(recorded "$2")
  if [[ ! -f "originals/$1" ]] || { [[ -n "$rec" ]] && [[ "$rec" != "$3" ]]; }; then cp "$1" "originals/$1"; fi
}
mb() { awk -v b="$1" 'BEGIN{printf "%.1f MB", b/1000000}'; }
# scale so the LONG side is at most $1 px (works for landscape and portrait), keep even dimensions
fit() { echo "scale='if(gt(iw,ih),min($1,iw),-2)':'if(gt(iw,ih),-2,min($1,ih))':flags=lanczos"; }
# adds ",fps=30" only when the source is faster than 30 fps
fpscap() {
  local r; r=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$1" | head -n1 | tr -d ',')
  awk -v r="$r" 'BEGIN{split(r,a,"/"); f=(a[2]>0)?a[1]/a[2]:a[1]; if (f>30.5) printf ",fps=30"}'
}
enc() { # in out maxside crf maxrate bufsize
  # shellcheck disable=SC2086
  ffmpeg -y -loglevel error -i "$1" $TFLAG -an -vf "$(fit "$3")$(fpscap "$1")" -c:v libx264 -preset slow \
         -crf "$4" -maxrate "$5" -bufsize "$6" -pix_fmt yuv420p -profile:v high -level 4.1 -tag:v avc1 \
         -g 60 -movflags +faststart "$2"
}

# rebuild the phone file + poster from the video that is currently in the folder
refresh_derived() { # file base
  enc "$1" "tmp_$2-m.mp4" 1280 26 1600k 3200k && mv "tmp_$2-m.mp4" "$2-m.mp4"
  ffmpeg -y -loglevel error -ss 0.1 -i "$1" -frames:v 1 -vf "$(fit 1280)" -q:v 5 "$2-poster.jpg"
  echo "refresh $2-m.mp4 + $2-poster.jpg ($(mb "$(fsize "$2-m.mp4")"))"
}

# --redo name.ext : forget everything about that file so the one in the folder counts as a brand new original
if [[ -n "$REDO" ]]; then
  IFS='|' read -ra _r <<< "$REDO"
  for n in "${_r[@]}"; do
    [[ -n "$n" ]] || continue
    [[ -f "$n" ]] || { echo "redo: $n not found in this folder"; continue; }
    b="${n%.*}"
    rm -f "originals/$n" "$b-m.mp4" "$b-poster.jpg"
    awk -F'\t' -v n="$n" '$1!=n' "$STATE" > "$STATE.tmp" && mv "$STATE.tmp" "$STATE"
    echo "redo   $n: the file in this folder is used as the new original"
  done
fi

if [[ $MARK == 1 ]]; then
  # trust only files that were really processed before: the original backup exists (videos also need -m + poster)
  for f in *.mp4; do
    [[ -e "$f" && "$f" != *-m.mp4 && "$f" != tmp_* ]] || continue
    b="${f%.mp4}"
    if [[ -f "originals/$f" && -f "$b-m.mp4" && -f "$b-poster.jpg" ]]; then record "$f" "$(fsize "$f")"; echo "marked $f"
    else echo "NOT marked $f (not optimized yet, it will be processed on the next normal run)"; fi
  done
  for f in *.jpg *.jpeg; do
    [[ -e "$f" && "$f" != *-poster.jpg ]] || continue
    if [[ -f "originals/$f" ]]; then record "$f" "$(fsize "$f")"; echo "marked $f"; fi
  done
  echo "Done. Everything above counts as optimized now. Run it normally from now on."; exit 0
fi

for f in *.mp4; do
  [[ -e "$f" ]] || continue
  [[ "$f" == *-m.mp4 ]] && continue
  [[ "$f" == tmp_* ]] && continue
  base="${f%.mp4}"; cur=$(fsize "$f")
  if [[ $FORCE == 0 && "$(recorded "$f")" == "$cur" && -f "$base-m.mp4" && -f "$base-poster.jpg" ]]; then
    if [[ $REFRESH == 1 || "$f" -nt "$base-m.mp4" || "$f" -nt "$base-poster.jpg" ]]; then
      refresh_derived "$f" "$base"
    else
      echo "skip   $f (already optimized)"
    fi
    continue
  fi
  sync_original "$f" "$f" "$cur"
  src="originals/$f"; size=$(fsize "$src")
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src" | head -n1 | tr -d ',')

  # desktop file
  if [[ $LOSSLESS == 1 && "$codec" == "h264" ]]; then
    # shellcheck disable=SC2086
    ffmpeg -y -loglevel error -i "$src" $TFLAG -an -c:v copy -movflags +faststart "tmp_$f"; how="lossless faststart"
  else
    enc "$src" "tmp_$f" 1600 23 3500k 7000k; how="web quality"
    if [[ "$codec" == "h264" && "$TRIM" == "0" ]] && (( $(fsize "tmp_$f") >= size )); then
      ffmpeg -y -loglevel error -i "$src" -an -c:v copy -movflags +faststart "tmp_$f"; how="already small: faststart only"
    fi
  fi
  mv "tmp_$f" "$f"
  out=$(fsize "$f"); record "$f" "$out"
  echo "video  $f: $(mb "$size") -> $(mb "$out") ($how)"
  if (( out > 10000000 )); then echo "       tip: still big. Try  ./optimize-media.sh --max-seconds 12  (short loops start instantly)"; fi

  # phone + iPad file
  enc "$src" "tmp_$base-m.mp4" 1280 26 1600k 3200k && mv "tmp_$base-m.mp4" "$base-m.mp4"
  echo "video  $base-m.mp4: $(mb "$(fsize "$base-m.mp4")") (phones + iPad)"

  # poster = first frame (small: it only has to look right for a moment)
  ffmpeg -y -loglevel error -ss 0.1 -i "$f" -frames:v 1 -vf "$(fit 1280)" -q:v 5 "$base-poster.jpg"
done

for f in *.jpg *.jpeg; do
  [[ -e "$f" ]] || continue
  [[ "$f" == *-poster.jpg ]] && continue
  [[ "$f" == tmp_* ]] && continue
  size=$(fsize "$f")
  [[ $FORCE == 0 && "$(recorded "$f")" == "$size" ]] && continue   # already done
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$f" | head -n1 | tr -dc '0-9'); w=${w:-0}
  if (( w > 1600 || size > 300000 )); then
    sync_original "$f" "$f" "$size"
    # -map 0:v:0 = only the main picture (phone photos can carry extra images that confuse ffmpeg)
    if ! ffmpeg -y -loglevel error -i "originals/$f" -map 0:v:0 -vf "scale='min(1600,iw)':-2:flags=lanczos" -map_metadata -1 -q:v 4 "tmp_$f"; then
      rm -f "tmp_$f"; echo "image  $f: could not be compressed, kept as is"; record "$f" "$size"; continue
    fi
    if (( $(fsize "tmp_$f") < size )); then mv "tmp_$f" "$f"; echo "image  $f: $((size/1000)) KB -> $(( $(fsize "$f")/1000 )) KB"
    else rm "tmp_$f"; echo "image  $f: already small, kept"; fi
    record "$f" "$(fsize "$f")"
  fi
done
echo "Done. Upload ALL new .mp4 (including the -m ones), *-poster.jpg and .jpg files next to index.html."