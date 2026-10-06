#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/rest.shaclmate.ttl | sponge src/rest.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts src/rest.shaclmate.ttl | sponge src/rest.shaclmate.ts
npm exec biome -- check --write src/rest.shaclmate.ts
npm exec biome -- check --write src/rest.shaclmate.ts
