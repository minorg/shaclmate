import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import { describe, expect, it } from "vitest";
import { TS_FEATURES } from "../src/generators/ts/TsFeature.js";
import { compileTs } from "./compileTs.js";
import { logger } from "./logger.js";
import { testData } from "./testData.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function generate(
  shapesGraph: ShapesGraph,
  configuration?: Partial<TsGenerator.Configuration>,
): string {
  const source = new TsGenerator({ configuration, logger }).generate(
    new ShapesGraphToAstTransformer({ logger, shapesGraph })
      .transform()
      .unsafeCoerce(),
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
      let configuration: Partial<TsGenerator.Configuration> | undefined;
      let sourceDirectoryPath: string | undefined;
      switch (id) {
        case "compilerInput":
          configuration = {
            features: new Set(["RDF"]),
          };
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "src",
            "input",
          );
          break;
        case "kitchenSink":
          configuration = {
            ...TsGenerator.Configuration.default_,
            features: new Set([
              ...TsGenerator.Configuration.default_.features,
              "SPARQL",
            ]),
          };
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
          configuration = {
            ...TsGenerator.Configuration.default_,
            features: new Set(["RDF"]),
          };
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

      const source = generate(shapesGraphEither.unsafeCoerce(), configuration);
      const diagnostics = compileTs(source, sourceDirectoryPath);
      if (diagnostics.length > 0) {
        // biome-ignore lint/suspicious/noDebugger: allow in a test
        debugger;
      }
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }

  describe("TsFeature combinations", () => {
    const shapesGraph =
      testData.shapesGraphs.wellFormed.tsFeatureCombinations.unsafeCoerce();
    const sourceDirectoryPath = undefined; //path.join(thisDirectoryPath);

    for (const tsFeatureCombination of [
      ["Object.JSON"],
      ["RDF", "SPARQL"],
      TS_FEATURES,
      // Ablation
      ...TS_FEATURES.map((_, i) => TS_FEATURES.filter((_, j) => i !== j)),
    ] as const) {
      it(tsFeatureCombination.join("+"), () => {
        const source = new TsGenerator({
          configuration: {
            ...TsGenerator.Configuration.default_,
            features: new Set(tsFeatureCombination),
          },
          logger,
        }).generate(
          new ShapesGraphToAstTransformer({
            logger,
            shapesGraph,
          })
            .transform()
            .unsafeCoerce(),
        );
        compileTs(source, sourceDirectoryPath);
      });
    }
  }, 60000);
});
