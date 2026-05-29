import dataFactory from "@rdfx/data-factory";
import { beforeAll, describe, it } from "vitest";
import type { Ontology } from "../src/generated.js";
import { testData } from "./testData.js";

describe("Ontology", () => {
  let sut: Ontology;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.syntax
      .unsafeCoerce()
      .ontology(dataFactory.namedNode("http://example.com/"))
      .unsafeCoerce();
  });

  it("label", ({ expect }) => {
    expect(sut.label.unsafeCoerce()).toStrictEqual("label");
  });
});
