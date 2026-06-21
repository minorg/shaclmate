#!/bin/bash

set -e

cd "$(dirname "$0")"

# rapper is stumbling on blank nodes when re-formatting the kitchen sink example
# rapper -i turtle -o turtle -q src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ttl
# riot --formatted=TURTLE src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ttl
npm exec @shaclmate/cli -- generate ast-json src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ast.json
time npm exec @shaclmate/cli -- generate ts --feature object.equals --feature object.hash --feature json --feature rdf --feature sparql src/kitchen-sink.shaclmate.ttl | sponge src/kitchen-sink.shaclmate.ts
npm exec biome -- check --write src/kitchen-sink.shaclmate.ts
npm exec biome -- check --write src/kitchen-sink.shaclmate.ts
