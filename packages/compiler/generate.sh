#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/input/input.shaclmate.ttl | sponge src/input/input.shaclmate.ttl
../../apps/cli/dist/cli.js generate ts $PWD/../shacl-ast/src/shacl-ast.shaclmate.ttl $PWD/src/input/input.shaclmate.ttl >src/input/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/input/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/input/generated.ts
