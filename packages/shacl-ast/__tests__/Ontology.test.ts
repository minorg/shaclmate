import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import type { Ontology } from "../src/shacl-ast.shaclmate.js";
import { ex } from "./namespaces.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("Ontology", () => {
  let sut: Ontology;

  beforeAll(async () => {
    sut = (await parseTestShapesGraph(testShapesGraphs.syntax))
      .unsafeCoerce()
      .ontology(ex(""))
      .unsafeCoerce();
  });

  it("label", ({ expect }) => {
    expect(sut.label.unsafeCoerce()).toStrictEqual("label");
  });
});
