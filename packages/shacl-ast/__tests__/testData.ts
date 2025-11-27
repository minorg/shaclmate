import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatasetCore } from "@rdfjs/types";
import { Parser, Store } from "n3";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { ShapesGraph, defaultFactory } from "../src/index.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseDataset(filePath: string): DatasetCore {
  const parser = new Parser({ format: "Turtle" });
  const store = new Store();
  store.addQuads(parser.parse(fs.readFileSync(filePath).toString()));
  return store;
}

function parseShapesGraph(
  filePath: string,
  options?: { excludeDash?: boolean; ignoreUndefinedShapes?: boolean },
) {
  return ShapesGraph.fromDataset(
    parseDataset(filePath),
    defaultFactory,
    options,
  ).unsafeCoerce();
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
  get schema() {
    return {
      shapesGraph: parseShapesGraph(
        path.join(thisDirectoryPath, "data", "schemashacl.ttl"),
        { excludeDash: true, ignoreUndefinedShapes: true },
      ),
    };
  }

  @Memoize()
  get skos() {
    return Maybe.of(
      path.join(
        thisDirectoryPath,
        "..",
        "..",
        "..",
        "..",
        "kos-kit",
        "lib",
        "packages",
        "models",
        "models.shaclmate.ttl",
      ),
    )
      .filter((filePath) => fs.existsSync(filePath))
      .map(parseShapesGraph);
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
