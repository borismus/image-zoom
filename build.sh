#!/usr/bin/env sh

for i in originals/*
do
  ./process_images.sh $i images/`basename ${i%.*}`
done
