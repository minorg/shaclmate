import { describe, it } from "vitest";
import { ShapesGraph } from "../src/ShapesGraph.js";
import { defaultFactory } from "../src/defaultFactory.js";
import { testData } from "./testData.js";

describe("ShapesGraph: kitchen sink", () => {
  it("should parse the shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.nodeShapes).toHaveLength(90);
    expect(testData.kitchenSink.shapesGraph.propertyShapes).toHaveLength(123);
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

describe("RdfsjsShapesGraph: error cases", () => {
  it("should produce an error on an undefined shape", ({ expect }) => {
    const error = ShapesGraph.fromDataset(
      testData.undefinedShape.dataset,
      defaultFactory,
    ).extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes("undefined shape");
  });
});
