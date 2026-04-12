#!/bin/sh

for f in *.ttl; do
  rapper -i turtle -o turtle -q "$f" | sponge "$f"
done
