import path from "node:path";
import { fileURLToPath } from "node:url";
import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import { describe, expect, it } from "vitest";
import { compileTs } from "./compileTs.js";
import { testData } from "./testData.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function generate(parameters: {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
}): string {
  const source = new TsGenerator().generate(
    new ShapesGraphToAstTransformer(parameters).transform().unsafeCoerce(),
  );
  expect(source).not.toHaveLength(0);
  return source;
}

describe("TsGenerator", () => {
  for (const [id, shapesGraphEither] of Object.entries(
    testData.shapesGraphs.wellFormed,
  )) {
    if (shapesGraphEither === null) {
      continue;
    }

    it(id, () => {
      let sourceDirectoryPath: string | undefined;
      switch (id) {
        case "compilerInput":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "src",
            "input",
          );
          break;
        case "kitchenSink":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "..",
            "..",
            "examples",
            "kitchen-sink",
            "src",
          );
          break;
        case "shaclAst":
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "..",
            "shacl-ast",
            "src",
          );
          break;
      }

      if (id !== "kitchenSink") {
        return;
      }

      const diagnostics = compileTs(
        generate(shapesGraphEither.unsafeCoerce()),
        sourceDirectoryPath,
      );
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }

  describe("TsFeature combinations", () => {
    const { iriPrefixMap, shapesGraph } =
      testData.shapesGraphs.wellFormed.tsFeatureCombinations.unsafeCoerce();
    const sourceDirectoryPath = undefined; //path.join(thisDirectoryPath);

    const tsFeaturesAll = [
      "create",
      "equals",
      "graphql",
      "hash",
      "json",
      "rdf",
      "sparql",
    ] as const;

    for (const tsFeatureCombination of [
      ["json"],
      ["rdf", "sparql"],
      tsFeaturesAll,
      // Ablation
      ...tsFeaturesAll.map((_, i) => tsFeaturesAll.filter((_, j) => i !== j)),
    ] as const) {
      it(tsFeatureCombination.join("+"), () => {
        const source = new TsGenerator().generate(
          new ShapesGraphToAstTransformer({
            iriPrefixMap,
            shapesGraph,
            tsFeaturesDefault: new Set(tsFeatureCombination),
          })
            .transform()
            .unsafeCoerce(),
        );
        compileTs(source, sourceDirectoryPath);
      });
    }
  }, 60000);
});
