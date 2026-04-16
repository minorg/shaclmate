import path from "node:path";
import { fileURLToPath } from "node:url";
import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  ZodGenerator,
} from "@shaclmate/compiler";
import { describe, expect, it } from "vitest";
import { compileTs } from "./compileTs.js";
import { testData } from "./testData.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

function generate(parameters: {
  iriPrefixMap: PrefixMap;
  shapesGraph: ShapesGraph;
}): string {
  const source = new ZodGenerator().generate(
    new ShapesGraphToAstTransformer(parameters).transform().unsafeCoerce(),
  );
  expect(source).not.toHaveLength(0);
  return source;
}

describe("ZodGenerator", () => {
  for (const [id, shapesGraphEither] of Object.entries(
    testData.shapesGraphs.wellFormed,
  )) {
    if (shapesGraphEither === null) {
      continue;
    }

    switch (id) {
      case "compilerInput":
      case "shaclAst":
      case "tsFeatureCombinations":
        continue;
    }

    it(id, () => {
      let sourceDirectoryPath: string | undefined;
      switch (id) {
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
      }

      const diagnostics = compileTs(
        generate(shapesGraphEither.unsafeCoerce()),
        sourceDirectoryPath,
      );
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }
});
