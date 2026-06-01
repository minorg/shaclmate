import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  ZodGenerator,
} from "@shaclmate/compiler";
import type { Either } from "purify-ts";
import { describe, expect, it } from "vitest";
import { compileTs } from "./compileTs.js";
import { logger } from "./logger.js";
import { testData } from "./testData.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

describe("ZodGenerator", () => {
  for (const [id, shapesGraphEither] of Object.entries(
    testData.shapesGraphs.wellFormed,
  ) as [
    keyof typeof testData.shapesGraphs.wellFormed,
    Either<Error, ShapesGraph>,
  ][]) {
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
      if (id !== "kitchenSinkExample") {
        return;
      }

      let sourceDirectoryPath: string | undefined;
      switch (id) {
        case "kitchenSinkExample":
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

      const source = new ZodGenerator({ logger }).generate(
        new ShapesGraphToAstTransformer({
          logger,
          shapesGraph: shapesGraphEither.unsafeCoerce(),
        })
          .transform()
          .unsafeCoerce(),
      );
      expect(source).not.toHaveLength(0);
      const diagnostics = compileTs(source, sourceDirectoryPath);
      if (diagnostics.length > 0) {
        // biome-ignore lint/suspicious/noDebugger: <explanation>
        debugger;
      }
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }
});
