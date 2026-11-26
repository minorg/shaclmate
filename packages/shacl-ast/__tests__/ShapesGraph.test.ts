import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("ShapesGraph", () => {
  describe("well-formed", () => {
    for (const [idString, testShapesGraph] of Object.entries(
      testShapesGraphs,
    )) {
      const id = idString as keyof typeof testShapesGraphs;
      if (testShapesGraph.kind === "error" || id === "featureCombinations") {
        continue;
      }

      describe(id, () => {
        let shapesGraph: ShapesGraph;

        beforeAll(async () => {
          shapesGraph = (
            await parseTestShapesGraph(testShapesGraph)
          ).unsafeCoerce();
        });

        if (testShapesGraph?.counts?.nodeShapes !== undefined) {
          it("nodeShapes", ({ expect }) => {
            expect(shapesGraph.nodeShapes).toHaveLength(
              testShapesGraph.counts!.nodeShapes!,
            );
          });
        }

        if (testShapesGraph?.counts?.propertyShapes !== undefined) {
          it("propertyShapes", ({ expect }) => {
            expect(shapesGraph.propertyShapes).toHaveLength(
              testShapesGraph.counts!.propertyShapes!,
            );
          });
        }

        if (testShapesGraph?.counts?.propertyGroups !== undefined) {
          it("propertyGroups", ({ expect }) => {
            expect(shapesGraph.propertyGroups).toHaveLength(
              testShapesGraph.counts!.propertyGroups!,
            );
          });
        }
      });
    }
  });

  describe("ill-formed", () => {
    it("undefined shape", async ({ expect }) => {
      const error = (
        await parseTestShapesGraph(testShapesGraphs.undefinedShape)
      ).extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("undefined shape");
    });
  });
});
