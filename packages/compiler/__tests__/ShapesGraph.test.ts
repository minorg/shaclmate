import { type ShapesGraph, TsGenerator } from "@shaclmate/compiler";
import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { logger } from "./logger.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("ShapesGraph", () => {
  let sut: ShapesGraph;

  beforeAll(async () => {
    sut = (
      await parseTestShapesGraph(testShapesGraphs.shaclShacl)
    ).unsafeCoerce();
  });

  it("compile", ({ expect }) => {
    const source = sut
      .compile({ generator: new TsGenerator({ logger }), logger })
      .unsafeCoerce();
    expect(source).not.toHaveLength(0);
  });

  it("toAst", ({ expect }) => {
    const ast = sut.toAst({ logger }).unsafeCoerce();
    expect(ast.namedTypes).not.toHaveLength(0);
  });
});
