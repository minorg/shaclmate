import datasetFactory from "@rdfjs/dataset";
import { RdfFile } from "@rdfx/fs";
import { ShapesGraph, TsGenerator } from "@shaclmate/compiler";
import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { logger } from "./logger.js";

describe("ShapesGraph", () => {
  let sut: ShapesGraph;

  beforeAll(async () => {
    sut = ShapesGraph.builder()
      .parseDataset(
        (
          await RdfFile.fromPath(testShapesGraphs.shaclShacl.filePaths[0])
            .unsafeCoerce()
            .parseInto(datasetFactory.dataset())
        ).unsafeCoerce(),
      )
      .unsafeCoerce()
      .build();
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
