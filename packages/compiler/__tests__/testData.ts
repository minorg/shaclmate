import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import datasetFactory from "@rdfjs/dataset";
import type { PrefixMapInit } from "@rdfjs/prefix-map/PrefixMap.js";
import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import dataFactory from "@rdfx/data-factory";
import { ShapesGraph } from "@shaclmate/compiler";
import { Parser } from "n3";
import { Either, Maybe } from "purify-ts";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function parseShapesGraph(
  ...filePaths: readonly string[]
): Either<Error, ShapesGraph> {
  return Either.encase(() => {
    const dataset = datasetFactory.dataset();
    const iriPrefixes: PrefixMapInit = [];
    const parser = new Parser({ factory: dataFactory, format: "Turtle" });
    for (const filePath of filePaths) {
      for (const quad of parser.parse(
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
      )) {
        dataset.add(quad);
      }
    }
    return { dataset, iriPrefixes };
  }).chain(({ dataset, iriPrefixes }) =>
    ShapesGraph.builder()
      .parseDataset(dataset, {
        prefixMap: new PrefixMap(iriPrefixes, { factory: dataFactory }),
      })
      .map((_) => _.build()),
  );
}

export const testData = {
  shapesGraphs: {
    illFormed: {},

    wellFormed: {
      get graphqlExample() {
        return parseShapesGraph();
      },

      get nodeShapeNameConflicts() {
        return parseShapesGraph(
          path.join(thisDirectoryPath, "data", "node-shape-name-conflicts.ttl"),
        );
      },

      get propertyShapeNameConflicts() {
        return parseShapesGraph(
          path.join(
            thisDirectoryPath,
            "data",
            "property-shape-name-conflicts.ttl",
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
          .map(parseShapesGraph)
          .extractNullable();
      },

      get tsFeatureCombinations() {
        return parseShapesGraph(
          path.join(
            thisDirectoryPath,
            "data",
            "ts-feature-combinations.shaclmate.ttl",
          ),
        );
      },
    },
  },
} as const;
