#!/bin/bash

set -e

cd "$(dirname "$0")"

./forms/generate.sh
./graphql/generate.sh
./kitchen-sink/generate.sh

cd ..
npm run check:write
