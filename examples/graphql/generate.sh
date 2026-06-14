#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/graphql.shaclmate.ttl | sponge src/graphql.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts --feature graphql --feature rdf src/graphql.shaclmate.ttl | sponge src/graphql.shaclmate.ts
npm exec biome -- check --write src/graphql.shaclmate.ts
npm exec biome -- check --write src/graphql.shaclmate.ts
