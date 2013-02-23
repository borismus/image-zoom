#!/usr/bin/env zsh
SRC=$1
OUT=$2
MANIFEST=manifest.json

mkdir -p $OUT

# Create 2x version.
convert $SRC -quality 100 ${OUT}/2x.jpg
cd $OUT
# Create 1x version.
convert 2x.jpg -resize 50% 1x.jpg
# Create compressed versions.
for quality in {10..100..10}
do
  convert 2x.jpg -quality $quality 2x-$quality.jpg
  convert 1x.jpg -quality $quality 1x-$quality.jpg
  cwebp -q $quality 2x.jpg -o 2x-$quality.webp &> /dev/null
  cwebp -q $quality 1x.jpg -o 1x-$quality.webp &> /dev/null
done
# Crop everything into little samples for clarity.
#for img in *1x.jpg
#do
#  convert $img -crop 160x120+0+0 preview/$img;
#done
#for img in *2x.jpg
#do
#  convert $img -crop 320x240+0+0 preview/$img;
#done
# Tile into a preview.
#montage -label '%f, %b -- quality: %Q' preview/*x.jpg -shadow -border 5 -geometry 320x240+5+5 preview/tile.jpg

echo '{' > $MANIFEST
for file in *
do
  echo -n \"$OUT/$file\": \"`du -h $file | cut -s -f1`\", >> $MANIFEST
done
# Remove the trailing comma.
sed -ie 's/,$//' $MANIFEST

echo '}' >> $MANIFEST
