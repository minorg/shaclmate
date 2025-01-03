import { beforeAll, describe, it } from "vitest";
import { RdfjsShapesGraph } from "../RdfjsShapesGraph.js";
import {
  type DefaultRdfjsShapesGraph,
  defaultRdfjsFactory,
} from "../defaultRdfjsFactory.js";
import { testData } from "./testData.js";

describe("RdfjsShapesGraph", () => {
  let shapesGraph: DefaultRdfjsShapesGraph;

  beforeAll(() => {
    shapesGraph = new RdfjsShapesGraph({
      dataset: testData.shapesGraph,
      factory: defaultRdfjsFactory,
    });
  });

  it("should parse the shapes correctly", ({ expect }) => {
    expect(shapesGraph.nodeShapes).toHaveLength(84);
    expect(shapesGraph.propertyShapes).toHaveLength(70);
  });

  it("should parse ontologies correctly", ({ expect }) => {
    expect(shapesGraph.ontologies).toHaveLength(2);
  });

  it("should parse property shapes correctly", ({ expect }) => {
    expect(shapesGraph.propertyGroups).toHaveLength(1);
  });
});
