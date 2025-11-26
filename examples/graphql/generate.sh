#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf src/graphql.shaclmate.ttl
../../apps/cli/dist/cli.js generate src/graphql.shaclmate.ttl >src/generated.ts
npm exec biome -- check --write src/generated.ts
npm exec biome -- check --write src/generated.ts
