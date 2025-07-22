# SHACLmate

Command line program and libraries for generating [TypeScript](https://www.typescriptlang.org/) code from [SHACL](https://www.w3.org/TR/shacl/) shapes.

## Motivation

Working with [RDF](https://www.w3.org/RDF/), [SPARQL](https://www.w3.org/TR/sparql11-overview/), and triple stores in code has never been as easy or productive as working with more mainstream technologies like relational databases. The RDF ecosystem lacks open source tools like [dbt](https://www.getdbt.com/) or [Prisma](https://www.prisma.io/) that minimize friction in the developer experience and lower the barrier to adoption. The degree of friction is far out of proportion to any differences in essential complexity between the underlying graph and relational technologies.

**SHACLmate is a tool for generating idiomatic, object-oriented abstractions over RDF graphs**, so developers can concentrate more on concise business logic and less on the graph data model.  Most tools in the RDF ecosystem take the opposite approach, emphasizing explicit, low-level manipulation and navigation of RDF graphs and execution of hand-written SPARQL queries at runtime (c.f., [RDF JavaScript Libraries](https://rdf.js.org/) for JavaScript/TypeScript examples). That approach is comparable to writing SQL directly in code when working with a relational database. It's occasionally necessary, but it shouldn't be the only option, especially for developers who are relatively unfamiliar with the RDF data model.

SHACLmate currently generates idiomatic TypeScript classes/interfaces from SHACL shapes. Crafting SHACL shapes is an obvious barrier to adoption and a productive developer experience. There are few open source tools for working with SHACL, and the examples in this repository were hand-written in Turtle. We are working on support for other input formats (e.g., a hosted domain-specific language for defining shapes) as well as additional output formats (other programming languages).

## Prerequisites

* [Node.js](https://nodejs.org/) 18+

## Usage

### Generate TypeScript code from SHACL shapes

    npx -y "@shaclmate/cli@latest" generate examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl >generated.ts

Substituting the path to your SHACL file for the example path.

The generated code is serialized by [ts-morph](https://ts-morph.com/) with minimal indentation and newlines. You will probably want to format it using a tool like [Biome](https://biomejs.dev/) or [prettier](https://prettier.io/).

### Add runtime library

The generated TypeScript code relies on various third-party libraries such as [sparql.js](https://github.com/RubenVerborgh/SPARQL.js/). To include these third-party libraries in your project, add [`@shaclmate/runtime`](https://www.npmjs.com/package/@shaclmate/runtime) to your `package.json` `dependencies`.

Note that the `@shaclmate/runtime` package does not include any code itself, only transitive `dependencies`.


## Features

* Generated code works in browsers and Node.js
* TypeScript class or interface generation
* TypeScript [union type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) generation from `sh:xone`
* TypeScript [literal type](https://www.typescriptlang.org/docs/handbook/literal-types.html) generation from `sh:in`
* RDF serialization and deserialization function/method generation
* JSON serialization and deserialization function/method generation
* SPARQL CONSTRUCT query generation
* Deep equals function/method generation
* Deep hash function/method generation
* Instance identifier minting by deep hashing or UUID generation
* [Zod schema](https://zod.dev/) generation. Zod schemas can be converted to [JSON schemas](https://json-schema.org/) using [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema).
* [JSON Forms](https://jsonforms.io/) schema generation
* [purify-ts](https://gigobyte.github.io/purify/) [`Maybe`](https://gigobyte.github.io/purify/adts/Maybe) types instead of `null`/`undefined`
* Support for using handwritten "extern" types from generated code
* Built on [RDF/JS](https://rdf.js.org/) standards
* Include/exclude generated code features at node shape or ontology level
* Decoupled concrete syntax -> abstract syntax -> code generator architecture (for future support of non-TypeScript code generators)

## Examples

### Kitchen sink ([examples/kitchen-sink](examples/kitchen-sink))

A "kitchen sink" demonstrating the code SHACLmate generates from many different SHACL shapes.

* [`src/kitchen-sink.shaclmate.ttl`](examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl): SHACL shapes in RDF demonstrating different features of SHACLmate
* [`src/generated.ts`](example/kitchen-sink/src/generated.ts): generated TypeScript code

To reproduce the generated code to stdout, run:

    npx -y "@shaclmate/cli@latest" generate examples/kitchen-sink/src/kitchen-sink.shaclmate.ttl

The compiler unit tests in [`packages/compiler/__tests__`](packages/compiler/__tests__) use the kitchen sink examples to test generated code.

### HTML forms ([examples/forms](examples/forms))

This directory contains a web application with HTML forms rendered at runtime using JSON Forms schemas generated by SHACLmate.

Run the application with:

    npm start

then open [http://localhost:3000](http://localhost:3000).

### GraphQL server ([examples/graphql](examples/graphql))

This directory contains a web application that serves a [GraphQL](https://graphql.org) endpoint with a [GraphiQL](https://github.com/graphql/graphiql) interface.

Build the application with:

    npm run build

Run the application with:

    npm start

then open [http://localhost:3000/graphql](http://localhost:3000/graphql) to open the Graphiql interface.

## SHACL support

SHACLmate supports a subset of SHACL with a few extensions (under the [`shaclmate` namespace](http://purl.org/shaclmate/ontology#)) necessary for generating code.

### [`sh:name`](https://www.w3.org/TR/shacl/#name)

SHACLmate uses `sh:name` to derive identifiers for generated code. Per the SHACL specification, `sh:name` is only valid on property shapes. SHACLmate prefers `shaclmate:name` for the identifiers of node shapes and as a way of overriding `sh:name` on property shapes.

### [Property paths](https://www.w3.org/TR/shacl/#property-paths)

Only [predicate paths](https://www.w3.org/TR/shacl/#property-path-predicate) are supported.

### [Value type constraint components](https://www.w3.org/TR/shacl/#core-components-value-type)

#### [`sh:class`](https://www.w3.org/TR/shacl/#ClassConstraintComponent)

SHACLmate tries to resolve `sh:class` to an `rdfs:Class`/`owl:Class` that is also an `sh:NodeShape`.

#### [`sh:datatype`](https://www.w3.org/TR/shacl/#DatatypeConstraintComponent)

SHACLmate generates built-in TypeScript types from corresponding XSD datatypes:

| XSD datatype | TypeScript type |
| ------------ | --------------- |
| `xsd:anyURI` | `string` |
| `xsd:boolean`  | `boolean` |
| `xsd:date` | `Date` |
| `xsd:dateTime` | `Date` |
| Numeric types | `number` |
| `xsd:string` | `string` |

All other datatypes generate an RDF/JS [`Literal`](https://rdf.js.org/data-model-spec/#literal-interface) type

#### [`sh:nodeKind`](https://www.w3.org/TR/shacl/#NodeKindConstraintComponent)

Every generated class or interface in TypeScript includes an `identifier` property that (uniquely) identifies an instance of the class/interface.

On a node shape, `sh:nodeKind` determines the type of `identifier`: a blank node, a named node (IRI), or either.

On a property shape, `sh:nodeKind` determines the type of the property.

### [Cardinality constraint components](https://www.w3.org/TR/shacl/#core-components-count)

SHACLmate uses [`sh:minCount`](https://www.w3.org/TR/shacl/#MinCountConstraintComponent) and [`sh:maxCount`](https://www.w3.org/TR/shacl/#MaxCountConstraintComponent) on property shapes to generate containers for the underlying property shape type. Consider a property shape with `sh:datatype` `xsd:string`:

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

Recognized by the compiler but unsupported in generators.

### [String-based constraint components](https://www.w3.org/TR/shacl/#core-components-string)

`sh:languageIn` is used to filter language-tagged literals when deserializing instances from RDF.

The other string-based constraint components are unsupported.

### [Property pair constraint components](https://www.w3.org/TR/shacl/#core-components-property-pairs)

Unsupported.

### [Logical constraint components](https://www.w3.org/TR/shacl/#core-components-logical)

* `sh:xone` is (mostly) supported on node shapes and property shapes and used to generate union types in TypeScript. 
* `sh:and` is recognized by the compiler but not generators.

### [Shape-based constraint components](https://www.w3.org/TR/shacl/#core-components-shape)

`sh:node` resolves a node shape as expected. Recursive node shapes are not supported in JSON (de)serialization but are supported by other features like RDF deserialization.

Qualified value shapes are unsupported.

### [Other constraint components](https://www.w3.org/TR/shacl/#core-components-others)

`sh:closed` and `sh:ignoredProperties` are unsupported.

`sh:hasValue` on a property shape generates code that checks for the expected value (among zero or more values of a property) on deserialization from RDF but not in other contexts.

`sh:in` is used to generate [literal types](https://www.typescriptlang.org/docs/handbook/literal-types.html) in TypeScript.

### SPARQL-based constraints and constraint components

Unsupported.