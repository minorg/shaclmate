import path from "node:path";
import { fileURLToPath } from "node:url";

// @ts-expect-error: this script will never be built into CommonJS, can ignore this error
const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

interface TestShapesGraph {
  readonly description: string;
  readonly filePaths: readonly string[];
  readonly kind: "dogfood" | "error" | "example" | "stress";
}

export const testShapesGraphs = {
  compilerInput: {
    description:
      "SHACL-SHACL + additional SHACLmate properties, used as inputs to the compiler",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "..",
        "packages",
        "shacl-ast",
        "src",
        "shacl-ast.shaclmate.ttl",
      ),
      path.join(
        thisDirectoryPath,
        "..",
        "packages",
        "compiler",
        "src",
        "input",
        "input.shaclmate.ttl",
      ),
    ],
    kind: "dogfood",
  },

  defaultValueHasValueConflict: {
    description:
      "Error: property shape sh:defaultValue type conflicts with sh:hasValue type",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "default-value-has-value-conflict.shaclmate.ttl",
      ),
    ],
    kind: "error",
  },

  defaultValueMultipleHasValues: {
    description:
      "Error: property shape with sh:defaultValue and multiple sh:hasValue's",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "default-value-multiple-has-values.shaclmate.ttl",
      ),
    ],
    kind: "error",
  },

  defaultValueInConflict: {
    description:
      "Error: property shape sh:defaultValue type conflicts with sh:in type",
    filePaths: [
      path.join(thisDirectoryPath, "default-value-in-conflict.shaclmate.ttl"),
    ],
    kind: "error",
  },

  featureCombinations: {
    description:
      "Minimal shapes graph to stress generator feature combinations",
    filePaths: [
      path.join(thisDirectoryPath, "feature-combinations.shaclmate.ttl"),
    ],
    kind: "stress",
  },

  graphqlExample: {
    description: "GraphQL example",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "..",
        "examples",
        "graphql",
        "src",
        "graphql.shaclmate.ttl",
      ),
    ],
    kind: "example",
  },

  ignoredNodeShapeReference: {
    description: "Error: reference to shaclmate:ignore'd node shape",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "ignored-node-shape-reference.shaclmate.ttl",
      ),
    ],
    kind: "error",
  },

  inversePathNodeKindConflict: {
    description:
      "Error: sh:inversePath when the sh:nodeKind isn't (blank node | IRI)",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "inverse-path-node-kind-conflict.shaclmate.ttl",
      ),
    ],
    kind: "error",
  },

  kitchenSinkExample: {
    description: "Kitchen sink example",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "..",
        "examples",
        "kitchen-sink",
        "src",
        "kitchen-sink.shaclmate.ttl",
      ),
    ],
    kind: "example",
  },

  nodeShapeNameConflicts: {
    description:
      "Node shape names that might conflict with names synthesized by the generator",
    filePaths: [path.join(thisDirectoryPath, "node-shape-name-conflicts.ttl")],
    kind: "stress",
  },

  noRequiredProperty: {
    description: "Error: node shape without a required property or rdf:type",
    filePaths: [
      path.join(thisDirectoryPath, "no-required-property.shaclmate.ttl"),
    ],
    kind: "error",
  },

  propertyShapeNameConflicts: {
    description:
      "Property shape names that might conflict with names synthesized by the generator",
    filePaths: [
      path.join(thisDirectoryPath, "property-shape-name-conflicts.ttl"),
    ],
    kind: "stress",
  },

  shaclShacl: {
    description: "SHACL-SHACL",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "..",
        "packages",
        "shacl-ast",
        "src",
        "shacl-ast.shaclmate.ttl",
      ),
    ],
    kind: "dogfood",
  },

  //   get skos() {
  //     return Maybe.of(
  //       path.join(
  //         thisDirectoryPath,
  //         "..",
  //         "..",
  //         "..",
  //         "..",
  //         "kos-kit",
  //         "lib",
  //         "packages",
  //         "models",
  //         "models.shaclmate.ttl",
  //       ),
  //     )
  //       .filter((filePath) => fs.existsSync(filePath))
  //       .map(parseShapesGraph)
  //       .extractNullable();
  //   },

  syntax: {
    description: "SHACL Core syntax testing",
    filePaths: [path.join(thisDirectoryPath, "syntax.ttl")],
    kind: "stress",
  },

  undefinedShape: {
    description: "Error: reference to an undefined shape",
    filePaths: [path.join(thisDirectoryPath, "undefined-shape.shaclmate.ttl")],
    kind: "error",
  },
} as const satisfies Record<string, TestShapesGraph>;
