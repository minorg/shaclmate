import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

interface TestShapesGraph {
  readonly description: string;
  readonly filePaths: readonly string[];
  readonly validShacl: boolean;
  readonly validShaclmate: boolean;
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
    validShacl: true,
    validShaclmate: true,
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
    validShacl: true,
    validShaclmate: false,
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
    validShacl: true,
    validShaclmate: false,
  },

  defaultValueInConflict: {
    description:
      "Error: property shape sh:defaultValue type conflicts with sh:in type",
    filePaths: [
      path.join(thisDirectoryPath, "default-value-in-conflict.shaclmate.ttl"),
    ],
    validShacl: true,
    validShaclmate: false,
  },

  featureCombinations: {
    description:
      "Minimal shapes graph to stress generator feature combinations",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "data",
        "feature-combinations.shaclmate.ttl",
      ),
    ],
    validShacl: true,
    validShaclmate: true,
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
    validShacl: true,
    validShaclmate: true,
  },

  ignoredNodeShapeReference: {
    description: "Error: reference to shaclmate:ignore'd node shape",
    filePaths: [
      path.join(
        thisDirectoryPath,
        "ignored-node-shape-reference.shaclmate.ttl",
      ),
    ],
    validShacl: true,
    validShaclmate: false,
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
    validShacl: true,
    validShaclmate: false,
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
    validShacl: true,
    validShaclmate: true,
  },

  nodeShapeNameConflicts: {
    description:
      "Node shape names that might conflict with names synthesized by the generator",
    filePaths: [path.join(thisDirectoryPath, "node-shape-name-conflicts.ttl")],
    validShacl: true,
    validShaclmate: true,
  },

  noRequiredProperty: {
    description: "Error: node shape without a required property or rdf:type",
    filePaths: [
      path.join(thisDirectoryPath, "no-required-property.shaclmate.ttl"),
    ],
    validShacl: true,
    validShaclmate: false,
  },

  propertyShapeNameConflicts: {
    description:
      "Property shape names that might conflict with names synthesized by the generator",
    filePaths: [
      path.join(thisDirectoryPath, "property-shape-name-conflicts.ttl"),
    ],
    validShacl: true,
    validShaclmate: true,
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
    validShacl: true,
    validShaclmate: true,
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
    validShacl: true,
    validShaclmate: false,
  },

  undefinedShape: {
    description: "Error: reference to an undefined shape",
    filePaths: [path.join(thisDirectoryPath, "undefined-shape.ttl")],
    validShacl: true,
    validShaclmate: false,
  },
} as const satisfies Record<string, TestShapesGraph>;
