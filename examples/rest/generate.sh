#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/rest.shaclmate.ttl | sponge src/rest.shaclmate.ttl
#npm exec @shaclmate/cli -- generate ts --feature object.create --feature service src/rest.shaclmate.ttl | sponge src/rest-types.shaclmate.ts
#npm exec @shaclmate/cli -- generate ts --feature loggingservice src/rest.shaclmate.ttl | sponge src/rest-decorators.shaclmate.ts
npm exec @shaclmate/cli -- generate ts --feature servicehttpapi src/rest.shaclmate.ttl | sponge src/rest-http-api.shaclmate.ts
npm exec biome -- check --write src/*.shaclmate.ts
npm exec biome -- check --write src/*.shaclmate.ts
