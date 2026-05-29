import dataFactory from "@rdfx/data-factory";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import type { PropertyShape } from "../src/generated.js";
import { ex } from "./namespaces.js";
import { testData } from "./testData.js";

describe("PropertyShape", () => {
  let sut: PropertyShape;

  beforeAll(() => {
    sut = testData.shapesGraphs.wellFormed.syntax
      .unsafeCoerce()
      .propertyShape(ex("PropertyShape"))
      .unsafeCoerce();
  });

  it("defaultValue", ({ expect }) => {
    expect(
      sut.defaultValue.extract()?.equals(dataFactory.literal("defaultValue")),
    ).toStrictEqual(true);
  });

  it("description", ({ expect }) => {
    expect(sut.description.extract()).toStrictEqual("description");
  });

  it("group", ({ expect }) => {
    expect(sut.groups).toHaveLength(1);
    expect(sut.groups[0].equals(ex("PropertyGroup"))).toStrictEqual(true);
  });

  it("maxCount", ({ expect }) => {
    expect(sut.maxCount.extract()).toStrictEqual(1n);
  });

  it("minCount", ({ expect }) => {
    expect(sut.minCount.extract()).toStrictEqual(0n);
  });

  it("name", ({ expect }) => {
    expect(sut.name.extract()).toStrictEqual("name");
  });

  it("order", ({ expect }) => {
    expect(sut.order.extract()).toStrictEqual(1);
  });

  it("path", ({ expect }) => {
    invariant(sut.path.termType === "NamedNode");
    expect(sut.path.equals(ex("path"))).toStrictEqual(true);
  });

  it("uniqueLang", ({ expect }) => {
    expect(sut.uniqueLang.extract()).toStrictEqual(true);
  });
});
