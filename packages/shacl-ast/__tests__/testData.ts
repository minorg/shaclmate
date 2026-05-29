import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import { ShapesGraph } from "@shaclmate/shacl-ast";
import { Parser } from "n3";
import type { Either } from "purify-ts";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseDataset(filePath: string): DatasetCore {
  return datasetFactory.dataset(
    new Parser({ format: "Turtle" }).parse(
      fs.readFileSync(filePath).toString(),
    ),
  );
}

function parseShapesGraph(
  filePath: string,
  options?: { ignoreUndefinedShapes?: boolean },
): Either<Error, ShapesGraph> {
  return ShapesGraph.builder()
    .parseDataset(parseDataset(filePath), options)
    .map((_) => _.build());
}

export const testData = {
  shapesGraphs: {
    illFormed: {
      get undefinedShape() {
        return parseShapesGraph(
          path.join(thisDirectoryPath, "data", "undefined-shape.shaclmate.ttl"),
        );
      },
    },

    wellFormed: {
      get kitchenSinkExample() {
        return parseShapesGraph(
          path.join(
            thisDirectoryPath,
            "..",
            "..",
            "..",
            "examples",
            "kitchen-sink",
            "src",
            "kitchen-sink.shaclmate.ttl",
          ),
        );
      },

      get propertyPaths() {
        return parseShapesGraph(
          path.join(thisDirectoryPath, "data", "property-paths.ttl"),
          { ignoreUndefinedShapes: true },
        );
      },

      get shaclAst() {
        return parseShapesGraph(
          path.join(
            thisDirectoryPath,
            "..",
            "..",
            "shacl-ast",
            "src",
            "shacl-ast.shaclmate.ttl",
          ),
        );
      },
    },
  },
};
