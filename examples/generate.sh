#!/bin/bash

set -e

cd "$(dirname "$0")/.."

format_rdf() {
  rapper -i turtle -o turtle -q $1 >temp.ttl
  mv -f temp.ttl $1
  echo "formatted $1"
}

# Forms
# format_rdf $PWD/examples/forms/src/forms.shaclmate.ttl
# ./packages/cli/dist/cli.js generate $PWD/examples/forms/src/forms.shaclmate.ttl >examples/forms/src/generated.ts

# GraphQL
# format_rdf $PWD/examples/graphql/src/graphql.shaclmate.ttl
# ./packages/cli/dist/cli.js generate $PWD/examples/forms/src/graphql.shaclmate.ttl >examples/graphql/src/generated.ts

# Kitchen sink
format_rdf $PWD/examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl
./packages/cli/dist/cli.js show-ast-json $PWD/examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl >examples/kitchen-sink/src/ast.json
./packages/cli/dist/cli.js generate $PWD/examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl >examples/kitchen-sink/src/generated.ts

npm exec biome -- check --write --unsafe $PWD/examples
