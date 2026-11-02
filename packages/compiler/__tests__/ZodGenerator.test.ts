import path from "node:path";
import { fileURLToPath } from "node:url";
import { ShapesGraphToAstTransformer, ZodGenerator } from "@shaclmate/compiler";
import { describe, expect, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { compileTs } from "./compileTs.js";
import { logger } from "./logger.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

const thisDirectoryPath = path.dirname(fileURLToPath(import.meta.url));

describe("ZodGenerator", () => {
  for (const [idString, testShapesGraph] of Object.entries(testShapesGraphs)) {
    const id = idString as keyof typeof testShapesGraphs;
    if (testShapesGraph.kind !== "example") {
      continue;
    }

    it(id, async () => {
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
        case "restExample":
          return;
      }

      const shapesGraph = (
        await parseTestShapesGraph(testShapesGraph)
      ).unsafeCoerce();
      const source = new ZodGenerator({ logger }).generate(
        new ShapesGraphToAstTransformer({
          logger,
          shapesGraph,
        })
          .transform()
          .unsafeCoerce(),
      );
      expect(source).not.toHaveLength(0);
      const diagnostics = compileTs(source, sourceDirectoryPath);
      if (diagnostics.length > 0) {
        // biome-ignore lint/suspicious/noDebugger: It's a test, it's fine.
        debugger;
      }
      expect(diagnostics).toHaveLength(0);
    }, 60000);
  }
});
