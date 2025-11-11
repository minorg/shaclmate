import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import N3 from "n3";
import type { Either } from "purify-ts";
import { beforeAll, describe, it } from "vitest";
import { ShapesGraphToAstTransformer } from "../src/ShapesGraphToAstTransformer.js";
import type { Ast } from "../src/ast/index.js";
import type { ShapesGraph } from "../src/input/ShapesGraph.js";
import { testData } from "./testData.js";

function transform(shapesGraph: ShapesGraph): Either<Error, Ast> {
  return new ShapesGraphToAstTransformer({
    iriPrefixMap: new PrefixMap(undefined, { factory: N3.DataFactory }),
    shapesGraph,
  }).transform();
}

describe("ShapesGraphToAstTransformer: kitchen sink", () => {
  let ast: Ast;
  const shapesGraph = testData.kitchenSink.shapesGraph;

  beforeAll(() => {
    ast = transform(shapesGraph).unsafeCoerce();
  });

  it("should transform kitchen object types", ({ expect }) => {
    expect(shapesGraph.nodeShapes).toHaveLength(88);
    expect(ast.objectTypes).toHaveLength(62);
  });

  it("should transform object intersection types", ({ expect }) => {
    expect(ast.objectIntersectionTypes).toHaveLength(0);
  });

  it("should transform object union types", ({ expect }) => {
    expect(ast.objectUnionTypes).toHaveLength(8);
  });
});
