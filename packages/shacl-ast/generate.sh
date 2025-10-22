#!/bin/bash

set -e

cd "$(dirname "$0")"

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
}

format_rdf $PWD/src/shacl-ast.shaclmate.ttl
../cli/dist/cli.js generate $PWD/src/shacl-ast.shaclmate.ttl >$PWD/src/generated.ts
# ../cli/dist/cli.js generate $PWD/src/shacl-ast.shaclmate.ttl
# ../cli/dist/cli.js show-ast-json $PWD/src/shacl-ast.shaclmate.ttl
npm exec biome -- check --write --unsafe $PWD/src/generated.ts
npm exec biome -- check --write --unsafe $PWD/src/generated.ts

