#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/shacl-ast.shaclmate.ttl | sponge src/shacl-ast.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts --feature object.fromrdf $PWD/src/shacl-ast.shaclmate.ttl | sponge $PWD/src/shacl-ast.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/shacl-ast.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/shacl-ast.shaclmate.ts

