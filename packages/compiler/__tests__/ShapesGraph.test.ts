import { type ShapesGraph, TsGenerator } from "@shaclmate/compiler";
import { beforeAll, describe, it } from "vitest";
import { logger } from "./logger.js";
import { testData } from "./testData.js";

describe("ShapesGraph", () => {
  let sut: ShapesGraph;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.compilerInput.unsafeCoerce();
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
