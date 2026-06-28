import datasetFactory from "@rdfjs/dataset";
import { RdfFile } from "@rdfx/fs";
import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { ShapesGraph } from "../src/ShapesGraph.js";

describe("ShapesGraph", () => {
  describe("well-formed", () => {
    for (const [id, testShapesGraph] of Object.entries(testShapesGraphs)) {
      if (testShapesGraph.kind === "error" || id === "featureCombinations") {
        continue;
      }

      describe(id, () => {
        let shapesGraph: ShapesGraph;

        beforeAll(async () => {
          const dataset = datasetFactory.dataset();
          for (const filePath of testShapesGraph.filePaths) {
            await RdfFile.fromPath(filePath).unsafeCoerce().parseInto(dataset);
          }
          shapesGraph = ShapesGraph.builder()
            .parseDataset(dataset)
            .unsafeCoerce()
            .build();
        });

        it("nodeShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.nodeShapes).toHaveLength(126);
          }
        });

        it("propertyShapes", ({ expect }) => {
          if (id === "kitchenSinkExample") {
            expect(shapesGraph.propertyShapes).toHaveLength(172);
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
    it("undefined shape", async ({ expect }) => {
      const error = ShapesGraph.builder()
        .parseDataset(
          (
            await RdfFile.fromPath(testShapesGraphs.undefinedShape.filePaths[0])
              .unsafeCoerce()
              .parseInto(datasetFactory.dataset())
          ).unsafeCoerce(),
        )
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("undefined shape");
    });
  });
});
