import dataFactory from "@rdfx/data-factory";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import type { PropertyShape } from "../src/generated.js";
import type { ShapesGraph } from "../src/ShapesGraph.js";
import { ex } from "./namespaces.js";
import { testData } from "./testData.js";

describe("PropertyShape", () => {
  let sut: PropertyShape;
  let shapesGraph: ShapesGraph;

  beforeAll(() => {
    shapesGraph = testData.shapesGraphs.wellFormed.syntax.unsafeCoerce();
    sut = shapesGraph.propertyShape(ex("PropertyShape")).unsafeCoerce();
  });

  it("defaultValue", ({ expect }) => {
    expect(
      sut.defaultValue.extract()?.equals(dataFactory.literal("defaultValue")),
    ).toStrictEqual(true);
  });

  it("description", ({ expect }) => {
    expect(sut.description.extract()).toStrictEqual("description");
  });

  it("disjoint", ({ expect }) => {
    expect(sut.disjoint).toHaveLength(1);
    expect(sut.disjoint[0].equals(ex("disjoint"))).toStrictEqual(true);
  });

  it("equals", ({ expect }) => {
    expect(sut.equals).toHaveLength(1);
    expect(sut.equals[0].equals(ex("equals"))).toStrictEqual(true);
  });

  it("group", ({ expect }) => {
    expect(sut.groups).toHaveLength(1);
    expect(sut.groups[0].equals(ex("PropertyGroup"))).toStrictEqual(true);
  });

  it("lessThan", ({ expect }) => {
    expect(sut.lessThan).toHaveLength(1);
    expect(sut.lessThan[0].equals(ex("lessThan"))).toStrictEqual(true);
  });

  it("lessThanOrEquals", ({ expect }) => {
    expect(sut.lessThanOrEquals).toHaveLength(1);
    expect(
      sut.lessThanOrEquals[0].equals(ex("lessThanOrEquals")),
    ).toStrictEqual(true);
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

  it("qualifiedMaxCount", ({ expect }) => {
    expect(sut.qualifiedMaxCount.extract()).toStrictEqual(1n);
  });

  it("qualifiedMinCount", ({ expect }) => {
    expect(sut.qualifiedMinCount.extract()).toStrictEqual(1n);
  });

  it("qualifiedValueShape", ({ expect }) => {
    const shapeIdentifier = sut.qualifiedValueShape.extract()!;
    expect(shapeIdentifier).toBeDefined();
    const shape = shapesGraph.shape(shapeIdentifier).unsafeCoerce();
    expect(shape.hasValues).toHaveLength(1);
    expect(shape.hasValues[0].equals(ex("qualifiedHasValue"))).toStrictEqual(
      true,
    );
  });

  it("qualifiedValueShapesDisjoint", ({ expect }) => {
    expect(sut.qualifiedValueShapesDisjoint.extract()).toStrictEqual(true);
  });

  it("path", ({ expect }) => {
    invariant(sut.path.termType === "NamedNode");
    expect(sut.path.equals(ex("path"))).toStrictEqual(true);
  });

  it("uniqueLang", ({ expect }) => {
    expect(sut.uniqueLang.extract()).toStrictEqual(true);
  });
});
