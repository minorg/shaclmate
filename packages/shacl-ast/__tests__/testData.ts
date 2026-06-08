import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import dataFactory from "@rdfx/data-factory";
import { Parser } from "n3";
import { Either } from "purify-ts";
import { ShapesGraph } from "../src/ShapesGraph.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseDataset(filePath: string): Either<Error, DatasetCore> {
  return Either.encase(() => {
    return datasetFactory.dataset(
      new Parser({ factory: dataFactory, format: "Turtle" }).parse(
        fs.readFileSync(filePath).toString(),
      ),
    );
  });
}

function parseShapesGraph(
  filePath: string,
  options?: { ignoreUndefinedShapes?: boolean },
): Either<Error, ShapesGraph> {
  return parseDataset(filePath).chain((dataset) =>
    ShapesGraph.builder()
      .parseDataset(dataset, options)
      .map((_) => _.build()),
  );
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

      get syntax() {
        return parseShapesGraph(
          path.join(thisDirectoryPath, "data", "syntax.ttl"),
          { ignoreUndefinedShapes: true },
        );
      },
    },
  },
};
