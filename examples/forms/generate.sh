#!/bin/bash

set -e

cd "$(dirname "$0")"

rapper -i turtle -o turtle -q src/forms.shaclmate.ttl | sponge src/forms.shaclmate.ttl
npm exec @shaclmate/cli -- generate ts --feature JSON --feature Object.toRdf src/forms.shaclmate.ttl | sponge src/forms.shaclmate.ts
#../../apps/cli/dist/cli.js generate cx2 src/forms.shaclmate.ttl | sponge forms.cx2
npm exec biome -- check --write src/forms.shaclmate.ts
npm exec biome -- check --write src/forms.shaclmate.ts
