#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/input/input.shaclmate.ttl | sponge src/input/input.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts --feature object.rdf $PWD/../shacl-ast/src/shacl-ast.shaclmate.ttl $PWD/src/input/input.shaclmate.ttl | sponge src/input/input.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/input/input.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/input/input.shaclmate.ts
