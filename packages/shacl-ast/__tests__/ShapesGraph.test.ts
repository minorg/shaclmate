import { ShapesGraph } from "@shaclmate/shacl-ast";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("Shapes Graph", () => {
  describe("kitchen sink example", () => {
    it("should parse the node shapes correctly", ({ expect }) => {
      expect(testData.kitchenSink.shapesGraph.nodeShapes).toHaveLength(127);
    });

    it("should parse the property shapes correctly", ({ expect }) => {
      expect(testData.kitchenSink.shapesGraph.propertyShapes).toHaveLength(161);
    });

    it("should parse property property groups correctly", ({ expect }) => {
      expect(testData.kitchenSink.shapesGraph.propertyGroups).toHaveLength(0);
    });

    it("toDataset", ({ expect }) => {
      expect(testData.kitchenSink.shapesGraph.toDataset().size).toBeGreaterThan(
        0,
      );
    });

    it("toString", ({ expect }) => {
      expect(testData.kitchenSink.shapesGraph.toString()).not.to.be.empty;
    });
  });

  describe("error cases", () => {
    it("undefined shape", ({ expect }) => {
      const error = ShapesGraph.builder()
        .parseDataset(testData.undefinedShape.dataset)
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("undefined shape");
    });
  });
});
