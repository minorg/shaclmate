import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import type { PropertyGroup } from "../src/shacl-ast.shaclmate.js";
import { ex } from "./namespaces.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("PropertyGroup", () => {
  let sut: PropertyGroup;

  beforeAll(async () => {
    sut = (await parseTestShapesGraph(testShapesGraphs.syntax))
      .unsafeCoerce()
      .propertyGroup(ex("PropertyGroup"))
      .unsafeCoerce();
  });

  it("label", ({ expect }) => {
    expect(sut.label.unsafeCoerce()).toStrictEqual("label");
  });
});
