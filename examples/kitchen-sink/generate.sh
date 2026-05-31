#!/bin/bash

set -e

cd "$(dirname "$0")"

# rapper is stumbling on blank nodes when re-formatting the kitchen sink example
rapper -i turtle -o turtle -q src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ttl
# riot --formatted=TURTLE src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ttl
../../apps/cli/dist/cli.js generate ast-json src/kitchen-sink.shaclmate.ttl | sponge src/ast.json
time ../../apps/cli/dist/cli.js generate ts --feature object.equals --feature object.hash --feature json --feature rdf --feature sparql src/kitchen-sink.shaclmate.ttl | sponge src/generated.ts
npm exec biome -- check --write src/generated.ts
npm exec biome -- check --write src/generated.ts
