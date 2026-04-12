#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf src/kitchen-sink.shaclmate.ttl
../../apps/cli/dist/cli.js generate ast-json src/kitchen-sink.shaclmate.ttl >src/ast.json
time ../../apps/cli/dist/cli.js generate ts src/kitchen-sink.shaclmate.ttl >src/generated.ts
npm exec biome -- check --write src/generated.ts
npm exec biome -- check --write src/generated.ts
