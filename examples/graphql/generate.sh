#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/graphql.shaclmate.ttl | sponge src/graphql.shaclmate.ttl
../../apps/cli/dist/cli.js generate ts src/graphql.shaclmate.ttl | sponge src/generated.ts
npm exec biome -- check --write src/generated.ts
npm exec biome -- check --write src/generated.ts
