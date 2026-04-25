import { fail } from "node:assert";
import type { NamedNode } from "@rdfjs/types";
import { dash, rdf, schema } from "@tpluscode/rdf-ns-builders";
import { describe, expect, it } from "vitest";
import { testData } from "./testData.js";

describe("PropertyShape", () => {
  const shapesGraph = testData.schema.shapesGraph;

  // it("should convert to a string", ({ expect }) => {
  //   expect(
  //     findPropertyShape(schema.Person, schema.givenName).toString(),
  //   ).not.toHaveLength(0);
  // });

  const findPropertyShape = (
    nodeShapeIdentifier: NamedNode,
    path: NamedNode,
  ) => {
    const nodeShape = shapesGraph.nodeShape(nodeShapeIdentifier).unsafeCoerce();
    const propertyShape = nodeShape.properties
      .map((_) => shapesGraph.propertyShape(_).unsafeCoerce())
      .find((propertyShape) => {
        const propertyShapePath = propertyShape.path;
        return (
          propertyShapePath.termType === "NamedNode" &&
          propertyShapePath.equals(path)
        );
      });
    expect(propertyShape).toBeDefined();
    return propertyShape!;
  };

  // No sh:defaultValue in the test data

  it("should have a group", ({ expect }) => {
    const groups = findPropertyShape(
      dash.ScriptAPIShape,
      dash.generateClass,
    ).groups.map((_) => shapesGraph.propertyGroup(_).unsafeCoerce());
    expect(groups).toHaveLength(1);
    expect(
      groups[0].$identifier.equals(dash.ScriptAPIGenerationRules),
    ).toStrictEqual(true);
  });

  it("should have an order", ({ expect }) => {
    expect(
      findPropertyShape(
        dash.ScriptAPIShape,
        dash.generatePrefixClasses,
      ).order.unsafeCoerce(),
    ).toStrictEqual(15);
  });

  it("should parse a property path", ({ expect }) => {
    const path = findPropertyShape(
      dash.ScriptAPIShape,
      dash.generatePrefixClasses,
    ).path;
    expect(path.termType).toStrictEqual("NamedNode");
    expect(
      (path as NamedNode).equals(dash.generatePrefixClasses),
    ).toStrictEqual(true);
  });

  it("should parse an inverse property path", ({ expect }) => {
    const nodeShape = shapesGraph.nodeShape(schema.Person).unsafeCoerce();
    for (const propertyShape of nodeShape.properties.map((_) =>
      shapesGraph.propertyShape(_).unsafeCoerce(),
    )) {
      if (propertyShape.path.termType !== "InversePath") {
        continue;
      }
      expect(propertyShape.path.path.termType).toStrictEqual("NamedNode");
      expect(
        (propertyShape.path.path as NamedNode).equals(schema.parent),
      ).toStrictEqual(true);
      return;
    }
    fail();
  });

  it("should parse a zero or more property path", ({ expect }) => {
    const nodeShape = shapesGraph.nodeShape(dash.ListShape).unsafeCoerce();
    for (const propertyShape of nodeShape.properties.map((_) =>
      shapesGraph.propertyShape(_).unsafeCoerce(),
    )) {
      if (propertyShape.path.termType !== "ZeroOrMorePath") {
        continue;
      }
      expect(propertyShape.path.path.termType).toStrictEqual("NamedNode");
      expect(
        (propertyShape.path.path as NamedNode).equals(rdf.rest),
      ).toStrictEqual(true);
      return;
    }
    fail();
  });
});
