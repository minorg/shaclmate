import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("ShapesGraph", () => {
  describe("well-formed", () => {
    for (const [id, testShapesGraph] of Object.entries(testShapesGraphs)) {
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

        it("nodeShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.nodeShapes).toHaveLength(133);
          }
        });

        it("propertyShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.propertyShapes).toHaveLength(179);
          } else {
            expect(shapesGraph.propertyShape).not.toHaveLength(0);
          }
        });

        it("propertyGroups", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.propertyGroups).toHaveLength(0);
          }
        });
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
