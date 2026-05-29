import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import { ShapesGraph } from "@shaclmate/shacl-ast";
import { Parser } from "n3";
import { Memoize } from "typescript-memoize";

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
) {
  return ShapesGraph.builder()
    .parseDataset(parseDataset(filePath), options)
    .unsafeCoerce()
    .build();
}

class TestData {
  @Memoize()
  get kitchenSink() {
    return {
      shapesGraph: parseShapesGraph(
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
      ),
    };
  }

  @Memoize()
  get propertyPaths() {
    return {
      shapesGraph: parseShapesGraph(
        path.join(thisDirectoryPath, "data", "property-paths.ttl"),
        { ignoreUndefinedShapes: true },
      ),
    };
  }

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
  }

  @Memoize()
  get undefinedShape() {
    return {
      dataset: parseDataset(
        path.join(thisDirectoryPath, "data", "undefined-shape.shaclmate.ttl"),
      ),
    };
  }
}

export const testData = new TestData();
