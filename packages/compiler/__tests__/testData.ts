import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import { ShapesGraph } from "@shaclmate/compiler";
import { DataFactory, Parser, Store } from "n3";
import { type Either, Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseShapesGraph(filePath: string): Either<
  Error,
  {
    iriPrefixMap: PrefixMap;
    shapesGraph: ShapesGraph;
  }
> {
  const parser = new Parser({ format: "Turtle" });
  const dataset = new Store();
  const iriPrefixes: PrefixMapInit = [];
  dataset.addQuads(
    parser.parse(
      fs.readFileSync(filePath).toString(),
      null,
      (prefix, prefixNode) => {
        const existingIriPrefix = iriPrefixes.find(
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

  return ShapesGraph.create({ dataset }).map((shapesGraph) => ({
    iriPrefixMap: new PrefixMap(iriPrefixes, { factory: DataFactory }),
    shapesGraph,
  }));
}

class TestData {
  @Memoize()
  get externalProject() {
    return Maybe.of(
      path.join(thisDirectoryPath, "external-project.shaclmate.ttl"),
    )
      .filter((filePath) => fs.existsSync(filePath))
      .map(parseShapesGraph);
  }

  @Memoize()
  get incompatibleNodeShapeIdentifiers() {
    return parseShapesGraph(
      path.join(
        thisDirectoryPath,
        "data",
        "incompatible-node-shape-identifiers.ttl",
      ),
    );
  }

  @Memoize()
  get kitchenSink() {
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
  get undefinedParentClass() {
    return parseShapesGraph(
      path.join(
        thisDirectoryPath,
        "data",
        "undefined-parent-class.shaclmate.ttl",
      ),
    );
  }
}

export const testData = new TestData();
