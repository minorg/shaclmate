#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ttl
../../apps/cli/dist/cli.js generate ast-json src/kitchen-sink.shaclmate.ttl | sponge src/ast.json
time ../../apps/cli/dist/cli.js generate ts src/kitchen-sink.shaclmate.ttl | sponge src/generated.ts
npm exec biome -- check --write src/generated.ts
npm exec biome -- check --write src/generated.ts
