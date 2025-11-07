import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, Store } from "n3";
import { ShapesGraph } from "../src/input/ShapesGraph.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseShapesGraph(filePath: string) {
  const parser = new Parser({ format: "Turtle" });
  const store = new Store();
  store.addQuads(parser.parse(fs.readFileSync(filePath).toString()));
  return new ShapesGraph({
    dataset: store,
  });
}

export const testData = {
  kitchenSink: {
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
  },
  undefinedShape: {
    shapesGraph: parseShapesGraph(
      path.join(thisDirectoryPath, "data", "undefined-shape.shaclmate.ttl"),
    ),
  },
};
