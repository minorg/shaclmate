import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  TsGenerator,
} from "@shaclmate/compiler";
import { describe, expect, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { TS_FEATURES } from "../src/generators/ts/TsFeature.js";
import { compileTs } from "./compileTs.js";
import { logger } from "./logger.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

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
  for (const [idString, testShapesGraph] of Object.entries(testShapesGraphs)) {
    const id = idString as keyof typeof testShapesGraphs;

    switch (testShapesGraph.kind) {
      case "dogfood":
      case "example":
        break;
      case "stress":
        if (id !== "empty") {
          continue;
        }
        break;
      default:
        continue;
    }

    it(id, async () => {
      let configuration: Partial<TsGenerator.Configuration> | undefined;
      let sourceDirectoryPath: string | undefined;
      switch (id) {
        case "compilerInput":
          configuration = {
            features: new Set(["Object.RDF"]),
          };
          sourceDirectoryPath = path.join(
            thisDirectoryPath,
            "..",
            "src",
            "input",
          );
          break;
        case "kitchenSinkExample":
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
        case "shaclShacl":
          configuration = {
            ...TsGenerator.Configuration.default_,
            features: new Set(["Object.RDF"]),
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

      // if (id !== "externalProject") {
      //   return;
      // }

      const shapesGraph = (
        await parseTestShapesGraph(testShapesGraph)
      ).unsafeCoerce();
      const source = generate(shapesGraph, configuration);
      const diagnostics = compileTs(source, sourceDirectoryPath);
      if (diagnostics.length > 0) {
        // biome-ignore lint/suspicious/noDebugger: allow in a test
        debugger;
      }
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }

  it("objectDiscriminantProperty", async () => {
    const shapesGraph = (
      await parseTestShapesGraph(testShapesGraphs.objectDiscriminantProperty)
    ).unsafeCoerce();
    const sourceDirectoryPath = undefined;

    const source = generate(shapesGraph, {
      objectDiscriminantProperty: {
        jsonName: "termType",
        name: "termType",
      },
    });
    const diagnostics = compileTs(source, sourceDirectoryPath);
    if (diagnostics.length > 0) {
      // biome-ignore lint/suspicious/noDebugger: allow in a test
      debugger;
    }
    expect(diagnostics).toHaveLength(0);
  });

  describe("TsFeature combinations", async () => {
    const shapesGraph = (
      await parseTestShapesGraph(testShapesGraphs.featureCombinations)
    ).unsafeCoerce();
    const sourceDirectoryPath = undefined; //path.join(thisDirectoryPath);

    for (const tsFeatureCombination of [
      ["Object.JSON"],
      ["RDF", "SPARQL"],
      TS_FEATURES,
      // Ablation
      ...TS_FEATURES.map((_, i) => TS_FEATURES.filter((_, j) => i !== j)),
    ] as const) {
      it(tsFeatureCombination.join("+"), () => {
        const source = generate(shapesGraph, {
          features: new Set(tsFeatureCombination),
        });
        const diagnostics = compileTs(source, sourceDirectoryPath);
        if (diagnostics.length > 0) {
          // biome-ignore lint/suspicious/noDebugger: allow in a test
          debugger;
        }
        expect(diagnostics).toHaveLength(0);
      });
    }
  }, 60000);
});
