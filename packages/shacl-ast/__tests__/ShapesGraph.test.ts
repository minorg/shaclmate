import { ShapesGraph } from "@shaclmate/shacl-ast";
import { describe, it } from "vitest";
import { testData } from "./testData.js";

describe("ShapesGraph: kitchen sink", () => {
  it("should parse the shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.nodeShapes).toHaveLength(127);
    expect(testData.kitchenSink.shapesGraph.propertyShapes).toHaveLength(139);
  });

  it("should parse ontologies correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.ontologies).toHaveLength(1);
  });

  it("should parse property shapes correctly", ({ expect }) => {
    expect(testData.kitchenSink.shapesGraph.propertyGroups).toHaveLength(0);
  });
});

describe("ShapesGraph: schema", () => {
  it("should parse the shapes correctly", ({ expect }) => {
    expect(testData.schema.shapesGraph.nodeShapes).toHaveLength(84);
    expect(testData.schema.shapesGraph.propertyShapes).toHaveLength(70);
  });

  it("should parse ontologies correctly", ({ expect }) => {
    expect(testData.schema.shapesGraph.ontologies).toHaveLength(2);
  });

  it("should parse property groups correctly", ({ expect }) => {
    expect(testData.schema.shapesGraph.propertyGroups).toHaveLength(1);
  });
});

testData.skos.ifJust((shapesGraph) => {
  describe("ShapesGraph: skos", () => {
    it("should parse the shapes correctly", ({ expect }) => {
      expect(shapesGraph.nodeShapes).toHaveLength(10);
      expect(shapesGraph.propertyShapes).toHaveLength(37);
    });

    it("should parse ontologies correctly", ({ expect }) => {
      expect(shapesGraph.ontologies).toHaveLength(3);
    });
  });
});

describe("RdfsjsShapesGraph: error cases", () => {
  it("should produce an error on an undefined shape", ({ expect }) => {
    const error = ShapesGraph.create({
      dataset: testData.undefinedShape.dataset,
    }).extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes("undefined shape");
  });
});
