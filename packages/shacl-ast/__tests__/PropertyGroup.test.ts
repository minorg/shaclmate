import { beforeAll, describe, it } from "vitest";
import type { PropertyGroup } from "../src/shacl-ast.shaclmate.js";
import { ex } from "./namespaces.js";
import { testData } from "./testData.js";

describe("PropertyGroup", () => {
  let sut: PropertyGroup;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.syntax
      .unsafeCoerce()
      .propertyGroup(ex("PropertyGroup"))
      .unsafeCoerce();
  });

  it("label", ({ expect }) => {
    expect(sut.label.unsafeCoerce()).toStrictEqual("label");
  });
});
