#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/shacl-ast.shaclmate.ttl | sponge src/shacl-ast.shaclmate.ttl
../../apps/cli/dist/cli.js generate ts $PWD/src/shacl-ast.shaclmate.ttl | sponge $PWD/src/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/generated.ts

