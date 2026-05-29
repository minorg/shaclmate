import { ShapesGraph } from "@shaclmate/shacl-ast";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("ShapesGraph: kitchen sink", () => {
  it("should parse the shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.nodeShapes).toHaveLength(127);
    expect(testData.kitchenSink.shapesGraph.propertyShapes).toHaveLength(161);
  });

  it("should parse property shapes correctly", ({ expect }) => {
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

describe("RdfsjsShapesGraph: error cases", () => {
  it("should produce an error on an undefined shape", ({ expect }) => {
    const error = ShapesGraph.builder()
      .parseDataset(testData.undefinedShape.dataset)
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes("undefined shape");
  });
});
