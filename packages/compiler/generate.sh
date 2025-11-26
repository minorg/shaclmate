#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf src/input/input.shaclmate.ttl
../../apps/cli/dist/cli.js generate $PWD/../shacl-ast/src/shacl-ast.shaclmate.ttl $PWD/src/input/input.shaclmate.ttl >src/input/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/input/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/input/generated.ts
