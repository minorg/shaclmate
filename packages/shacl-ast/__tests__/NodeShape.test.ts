import { rdfs, sh } from "@tpluscode/rdf-ns-builders";
import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import type { NodeShape } from "../src/shacl-ast.shaclmate.js";
import { ex } from "./namespaces.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("NodeShape", () => {
  let sut: NodeShape;

  beforeAll(async () => {
    sut = (await parseTestShapesGraph(testShapesGraphs.syntax))
      .unsafeCoerce()
      .nodeShape(ex("NodeShape"))
      .unsafeCoerce();
  });

  it("closed", ({ expect }) => {
    expect(sut.closed.extract()).toStrictEqual(true);
  });

  it("ignored properties", ({ expect }) => {
    const ignoredProperties = sut.ignoredProperties.extract();
    expect(ignoredProperties).toHaveLength(2);
    expect(ignoredProperties![0].equals(ex("ignoredProperty1"))).toStrictEqual(
      true,
    );
    expect(ignoredProperties![1].equals(ex("ignoredProperty2"))).toStrictEqual(
      true,
    );
  });

  it("properties", ({ expect }) => {
    expect(sut.properties).toHaveLength(1);
  });

  it("types", ({ expect }) => {
    expect(sut.types).toHaveLength(2);
    expect(sut.types.some((type) => type.equals(rdfs.Class))).toStrictEqual(
      true,
    );
    expect(sut.types.some((type) => type.equals(sh.NodeShape))).toStrictEqual(
      true,
    );
  });
});
