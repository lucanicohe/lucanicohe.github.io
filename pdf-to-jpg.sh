#!/bin/bash
# Turns the two magazine PDFs into one JPG per page, named the way index.html expects:
#   rena-p1.jpg, rena-p2.jpg ... and saitama-p1.jpg, saitama-p2.jpg ...
# Needs poppler:  brew install poppler
# Run it in the folder that contains rena.pdf and saitama.pdf, then push the jpgs with the site.
set -e
for name in rena saitama; do
  pages=$(pdfinfo "$name.pdf" | awk '/^Pages:/{print $2}')
  echo "$name: $pages pages"
  for i in $(seq 1 "$pages"); do
    pdftoppm -jpeg -jpegopt quality=80 -scale-to-x 1100 -scale-to-y -1 -f "$i" -l "$i" -singlefile "$name.pdf" "$name-p$i"
  done
done
echo "done"
