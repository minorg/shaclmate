import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("RdfjsShapesGraph", () => {
  it("should parse the shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.nodeShapes).toHaveLength(85);
    expect(testData.kitchenSink.shapesGraph.propertyShapes).toHaveLength(121);
    expect(testData.schema.shapesGraph.nodeShapes).toHaveLength(84);
    expect(testData.schema.shapesGraph.propertyShapes).toHaveLength(70);
  });

  it("should parse ontologies correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.ontologies).toHaveLength(1);
    expect(testData.schema.shapesGraph.ontologies).toHaveLength(2);
  });

  it("should parse property shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.propertyGroups).toHaveLength(0);
    expect(testData.schema.shapesGraph.propertyGroups).toHaveLength(1);
  });
});
