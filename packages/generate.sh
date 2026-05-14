#!/bin/bash

set -e

cd "$(dirname "$0")"

./compiler/generate.sh
./shacl-ast/generate.sh
