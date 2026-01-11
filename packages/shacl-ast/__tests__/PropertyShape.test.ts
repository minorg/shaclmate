import { fail } from "node:assert";
import type { NamedNode } from "@rdfjs/types";
import type { PredicatePath } from "@shaclmate/shacl-ast";
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
    const nodeShape = shapesGraph
      .nodeShapeByIdentifier(nodeShapeIdentifier)
      .unsafeCoerce();
    const propertyShape = nodeShape.constraints.properties
      .unsafeCoerce()
      .find((propertyShape) => {
        const propertyShapePath = propertyShape.path;
        return (
          propertyShapePath.kind === "PredicatePath" &&
          propertyShapePath.iri.equals(path)
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
    ).groups.unsafeCoerce();
    expect(groups).toHaveLength(1);
    expect(
      groups[0].identifier.equals(dash.ScriptAPIGenerationRules),
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
    expect(path.kind).toStrictEqual("PredicatePath");
    expect(
      (path as PredicatePath).iri.equals(dash.generatePrefixClasses),
    ).toStrictEqual(true);
  });

  it("should parse an inverse property path", ({ expect }) => {
    const nodeShape = shapesGraph
      .nodeShapeByIdentifier(schema.Person)
      .unsafeCoerce();
    for (const propertyShape of nodeShape.constraints.properties.unsafeCoerce()) {
      if (propertyShape.path.kind !== "InversePath") {
        continue;
      }
      expect(propertyShape.path.path.kind).toStrictEqual("PredicatePath");
      expect(
        (propertyShape.path.path as PredicatePath).iri.equals(schema.parent),
      ).toStrictEqual(true);
      return;
    }
    fail();
  });

  it("should parse a zero or more property path", ({ expect }) => {
    const nodeShape = shapesGraph
      .nodeShapeByIdentifier(dash.ListShape)
      .unsafeCoerce();
    for (const propertyShape of nodeShape.constraints.properties.unsafeCoerce()) {
      if (propertyShape.path.kind !== "ZeroOrMorePath") {
        continue;
      }
      expect(propertyShape.path.path.kind).toStrictEqual("PredicatePath");
      expect(
        (propertyShape.path.path as PredicatePath).iri.equals(rdf.rest),
      ).toStrictEqual(true);
      return;
    }
    fail();
  });
});
