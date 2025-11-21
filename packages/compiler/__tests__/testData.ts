import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import { ShapesGraph } from "@shaclmate/compiler";
import { DataFactory, Parser, Store } from "n3";
import { Maybe } from "purify-ts";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseShapesGraph(filePath: string): {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
} {
  const parser = new Parser({ format: "Turtle" });
  const dataset = new Store();
  const iriPrefixes: PrefixMapInit = [];
  dataset.addQuads(
    parser.parse(
      fs.readFileSync(filePath).toString(),
      null,
      (prefix, prefixNode) => {
        const existingIriPrefix = iriPrefixes.find(
          // @ts-ignore
          (iriPrefix) =>
            iriPrefix[0] === prefix || iriPrefix[1].equals(prefixNode),
        );
        if (existingIriPrefix) {
          if (
            existingIriPrefix[0] !== prefix ||
            !existingIriPrefix[1].equals(prefixNode)
          ) {
            // logger.warn("conflicting prefix %s: %s", prefix, prefixNode.value);
          }
          return;
        }

        iriPrefixes.push([prefix, prefixNode]);
      },
    ),
  );

  return {
    iriPrefixMap: new PrefixMap(iriPrefixes, { factory: DataFactory }),
    shapesGraph: ShapesGraph.fromDataset(dataset).unsafeCoerce(),
  };
}

export const testData = {
  externalProject: Maybe.of(
    path.join(thisDirectoryPath, "external-project.shaclmate.ttl"),
  )
    .filter((filePath) => fs.existsSync(filePath))
    .map(parseShapesGraph),
  kitchenSink: parseShapesGraph(
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
