#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/input/http-input.shaclmate.ttl | sponge src/input/http-input.shaclmate.ttl
rapper -i turtle -o turtle -q src/input/service-input.shaclmate.ttl | sponge src/input/service-input.shaclmate.ttl
rapper -i turtle -o turtle -q src/input/shape-input.shaclmate.ttl | sponge src/input/shape-input.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts --feature object.fromrdf $PWD/../shacl-ast/src/shacl-ast.shaclmate.ttl $PWD/src/input/http-input.shaclmate.ttl $PWD/src/input/service-input.shaclmate.ttl $PWD/src/input/shape-input.shaclmate.ttl | sponge src/input/input.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/input/input.shaclmate.ts
npm exec biome -- check --write --unsafe $PWD/src/input/input.shaclmate.ts
