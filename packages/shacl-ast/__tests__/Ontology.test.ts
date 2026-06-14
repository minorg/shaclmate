import { beforeAll, describe, it } from "vitest";
import type { Ontology } from "../src/shacl-ast.shaclmate.js";
import { ex } from "./namespaces.js";
import { testData } from "./testData.js";

describe("Ontology", () => {
  let sut: Ontology;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.syntax
      .unsafeCoerce()
      .ontology(ex(""))
      .unsafeCoerce();
  });

  it("label", ({ expect }) => {
    expect(sut.label.unsafeCoerce()).toStrictEqual("label");
  });
});
