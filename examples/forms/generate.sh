#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf src/forms.shaclmate.ttl
../../packages/cli/dist/cli.js generate src/forms.shaclmate.ttl >src/generated.ts
