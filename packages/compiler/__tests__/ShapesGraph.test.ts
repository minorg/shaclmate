import { type ShapesGraph, TsGenerator } from "@shaclmate/compiler";
import { beforeAll, describe, it } from "vitest";
import { testData } from "./testData.js";

describe("ShapesGraph", () => {
  let sut: ShapesGraph;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.compilerInput.unsafeCoerce();
  });

  it("compile", ({ expect }) => {
    const source = sut.compile({ generator: new TsGenerator() }).unsafeCoerce();
    expect(source).not.toHaveLength(0);
  });

  it("toAst", ({ expect }) => {
    const ast = sut.toAst().unsafeCoerce();
    expect(ast.namedObjectTypes).not.toHaveLength(0);
  });
});
