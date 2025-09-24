import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import N3 from "n3";
import { beforeAll, describe, it } from "vitest";
import { ShapesGraphToAstTransformer } from "../src/ShapesGraphToAstTransformer.js";
import type { Ast } from "../src/ast/index.js";
import { testData } from "./testData.js";

describe("ShapesGraphToAstTransformer", () => {
  let ast: Ast;
  const shapesGraph = testData.kitchenSink.shapesGraph;

  beforeAll(() => {
    ast = new ShapesGraphToAstTransformer({
      iriPrefixMap: new PrefixMap(undefined, { factory: N3.DataFactory }),
      shapesGraph,
    })
      .transform()
      .unsafeCoerce();
  });

  it("should transform object types", ({ expect }) => {
    expect(shapesGraph.nodeShapes).toHaveLength(81);
    expect(ast.objectTypes).toHaveLength(59);
  });

  it("should transform object intersection types", ({ expect }) => {
    expect(ast.objectIntersectionTypes).toHaveLength(0);
  });

  it("should transform object union types", ({ expect }) => {
    expect(ast.objectUnionTypes).toHaveLength(7);
  });

  testData.kitchenSink.shapesGraph;
});
