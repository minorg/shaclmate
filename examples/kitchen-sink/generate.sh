#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf src/kitchen-sink.shaclmate.ttl
../../packages/cli/dist/cli.js show-ast-json src/kitchen-sink.shaclmate.ttl >src/ast.json
#time ../../packages/cli/dist/cli.js generate src/kitchen-sink.shaclmate.ttl >src/generated.ts
