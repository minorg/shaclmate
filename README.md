# shaclmate

Command line program and library for transforming [SHACL](https://www.w3.org/TR/shacl/) shapes to [TypeScript](https://www.typescriptlang.org/) code.

## Prerequisites

* [Node.js](https://nodejs.org/) 18+

## Usage

    npx @shaclmate/cli@latest generate /path/to/shacl-in-rdf.ttl >generated.ts

## Features

* TypeScript class and interface generation
* RDF serialization and deserialization function/method generation
* JSON serialization and deserialization function/method generation
* SPARQL CONSTRUCT query generation
* Deep `equals` function/method generation
* Deep hash function/method generation
* Instance identifier minting by deep hashing or UUID generation
* [Zod schema](https://zod.dev/) generation. Zod schemas can be converted to [JSON schemas](https://json-schema.org/) using [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema)
* [JSON Forms](https://jsonforms.io/) schema generation
* TypeScript [union type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) generation
* TypeScript [literal types](https://www.typescriptlang.org/docs/handbook/literal-types.html) generation
* [`purify-ts`](https://gigobyte.github.io/purify/) [`Maybe`](https://gigobyte.github.io/purify/adts/Maybe) types instead of `null`/`undefined`
* Support for using handwritten "extern" types from generated code
* Built on [RDF/JS](https://rdf.js.org/) standards
* Decoupled concrete syntax -> abstract syntax -> code generator architecture (for future support of non-TypeScript code generators)

## Examples

### Kitchen sink ([examples/kitchen-sink](examples/kitchen-sink))

A "kitchen sink" demonstrating the code shaclmate generates from SHACL shapes.

* [`src/kitchen-sink.shaclmate.ttl`](examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl): SHACL shapes in RDF demonstrating different features of shaclmate
* [`src/generated.ts`](example/kitchen-sink/src/generated.ts): generated TypeScript code

To reproduce the generated code to stdout, run:

    cd examples/kitchen-sink
    npx @shaclmate/cli@latest generate src/kitchen-sink.shaclmate.ttl

The compiler unit tests in [`packages/compiler/__tests__`](packages/compiler/__tests__) use the kitchen sink examples to test generated code.

### Forms ([examples/forms](examples/forms))

This directory contains a web application (using vite) with HTML forms derived from SHACL shapes.

Run the application with:

    npm start

then open [http://localhost:3000](http://localhost:3000).

## SHACL support

shaclmate supports a subset of SHACL with a few extensions (under the [`shaclmate` namespace](http://purl.org/shaclmate/ontology#)) necessary for generating code.

### `sh:name`

shaclmate uses [`sh:name`]((https://www.w3.org/TR/shacl/#name)) to derive identifiers for generated code. Per the SHACL specification, `sh:name` is only valid on property paths. shaclmate prefers `shaclmate:name` for the identifiers of node shapes and as a way of overriding `sh:name` on property shapes.

### [Property paths](https://www.w3.org/TR/shacl/#property-paths)

Only [predicate paths](https://www.w3.org/TR/shacl/#property-path-predicate) are supported.

### [Value type constraint components](https://www.w3.org/TR/shacl/#core-components-value-type)

#### [`sh:class`](https://www.w3.org/TR/shacl/#ClassConstraintComponent)

`sh:class` tries to resolve a class to an `rdfs:Class`/`owl:Class` that is also an `sh:NodeShape`.

#### [`sh:datatype`](https://www.w3.org/TR/shacl/#DatatypeConstraintComponent)

A subset of XSD datatypes with corresponding TypeScript types are supported:

* `xsd:boolean` generates `boolean`
* `xsd:date` and `xsdDateTime` generate `Date`
* all numeric XSD datatypes generate `number`
* `xsd:string` and `xsd:anyURI` generate `string`

All other datatypes generated an RDF/JS [`Literal`](https://rdf.js.org/data-model-spec/#literal-interface) type

#### [`sh:nodeKind`](https://www.w3.org/TR/shacl/#NodeKindConstraintComponent)

Every generated class or interface in TypeScript includes an `identifier` property that (uniquely) identifies an instance of the class/interface.

On a node shape, `sh:nodeKind` determines the type of `identifier`: a blank node, a named node (IRI), or either.

On a property shape, `sh:nodeKind` determines the type of the property.

### [Cardinality constraint components](https://www.w3.org/TR/shacl/#core-components-count)

[`sh:minCount`](https://www.w3.org/TR/shacl/#MinCountConstraintComponent) and [`sh:maxCount`](https://www.w3.org/TR/shacl/#MaxCountConstraintComponent) on property shapes are used to generate containers for the underlying property shape type. Consider a property shape with `sh:datatype` `xsd:string`:

* `sh:minCount 1` and `sh:maxCount 1` would generate a required `string` in TypeScript
* `sh:minCount 0` and `sh:maxCount 0` would generate an [option type](https://en.wikipedia.org/wiki/Option_type) e.g., a `purify-ts` `Maybe<string>`
* `sh:minCount 1` with `sh:maxCount` greater than 1 would generate a non-empty list type e.g., a `purify-ts` `NonEmptyList<string>`
* All other combinations generate a possibly empty list e.g., `string[]`.

Note that:
* A property shape without an `sh:minCount` has an implicit `sh:minCount` of 0.
* `sh:minCount` cannot be negative.
* `sh:maxCount` must be greater than or equal to `sh:minCount`.

`sh:minCount` and `sh:maxCount` are ignored on node shapes.

### [Value Range Constraint Components](https://www.w3.org/TR/shacl/#core-components-range)

Recognized by the compiler but supported in generators.

### [String-based constraint components](https://www.w3.org/TR/shacl/#core-components-string)

`sh:languageIn` is used to filter language-tagged literals when deserializing instances from RDF.

The other string-based constraint components are unsupported.

### [Property pair constraint components](https://www.w3.org/TR/shacl/#core-components-property-pairs)

Unsupported.

### [Logical constraint components](https://www.w3.org/TR/shacl/#core-components-logical)

* `sh:xone` is (mostly) supported on node shapes and property shapes. 
* `sh:and` is recognized by the compiler but not generators.

### [Shape-based constraint components](https://www.w3.org/TR/shacl/#core-components-shape)

`sh:node` resolves a node shape as expected. Recursive node shapes are not supported in JSON (de)serialization but are supported by other features.

Qualified value shapes are unsupported.

### [Other constraint components](https://www.w3.org/TR/shacl/#core-components-others)

`sh:closed` and `sh:ignoredProperties` are unsupported.

`sh:hasValue` on a property shape generates code that checks for the expected value (among zero or more values of a property) on deserialization from RDF but not in other contexts.

`sh:in` is used to generate [literal types](https://www.typescriptlang.org/docs/handbook/literal-types.html) in TypeScript.

### SPARQL-based constraints and constraint components

Unsupported.