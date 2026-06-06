import type { Either } from "purify-ts";
import { beforeAll, describe, it } from "vitest";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { testData } from "./testData.js";

describe("ShapesGraph", () => {
  describe("well-formed", () => {
    for (const [id, shapesGraphEither] of Object.entries(
      testData.shapesGraphs.wellFormed,
    ) as [
      keyof typeof testData.shapesGraphs.wellFormed,
      Either<Error, ShapesGraph> | null,
    ][]) {
      if (shapesGraphEither === null) {
        continue;
      }

      describe(id, () => {
        let shapesGraph: ShapesGraph;

        beforeAll(() => {
          shapesGraph = shapesGraphEither.unsafeCoerce();
        });

        it("nodeShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.nodeShapes).toHaveLength(114);
          } else {
            expect(shapesGraph.nodeShapes).not.toHaveLength(0);
          }
        });

        it("propertyShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.propertyShapes).toHaveLength(163);
          } else {
            expect(shapesGraph.propertyShape).not.toHaveLength(0);
          }
        });

        it("propertyGroups", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.propertyGroups).toHaveLength(0);
          }
        });

        it("toDataset", ({ expect }) => {
          expect(shapesGraph.toDataset().size).toBeGreaterThan(0);
        });

        it("toString", ({ expect }) => {
          expect(shapesGraph.toString()).not.to.be.empty;
        });
      });
    }
  });

  describe("ill-formed", () => {
    it("undefined shape", ({ expect }) => {
      const error = testData.shapesGraphs.illFormed.undefinedShape.extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("undefined shape");
    });
  });
});
