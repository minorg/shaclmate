import PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import {
  type ShapesGraph,
  ShapesGraphToAstTransformer,
  type ast,
} from "@shaclmate/compiler";
import N3 from "n3";
import type { Either } from "purify-ts";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import { testData } from "./testData.js";

function transform(shapesGraph: ShapesGraph): Either<Error, ast.Ast> {
  return new ShapesGraphToAstTransformer({
    iriPrefixMap: new PrefixMap(undefined, { factory: N3.DataFactory }),
    shapesGraph,
  }).transform();
}

describe("ShapesGraphToAstTransformer: kitchen sink", () => {
  let ast: ast.Ast;
  const shapesGraph = testData.kitchenSink.shapesGraph;
  const astObjectTypesByIri: Record<string, ast.ObjectType> = {};

  beforeAll(() => {
    ast = transform(shapesGraph).unsafeCoerce();
    for (const astObjectType of ast.objectTypes) {
      if (astObjectType.name.identifier.termType !== "NamedNode") {
        continue;
      }
      invariant(!astObjectTypesByIri[astObjectType.name.identifier.value]);
      astObjectTypesByIri[astObjectType.name.identifier.value] = astObjectType;
    }
  });

  it("should transform kitchen object types", ({ expect }) => {
    expect(shapesGraph.nodeShapes).toHaveLength(96);
    expect(ast.objectTypes).toHaveLength(69);
  });

  it("should transform object intersection types", ({ expect }) => {
    expect(ast.objectIntersectionTypes).toHaveLength(0);
  });

  it("should transform object union types", ({ expect }) => {
    expect(ast.objectUnionTypes).toHaveLength(9);
  });

  for (const [classIri, recursivePropertyIri] of [
    [
      "http://example.com/DirectRecursiveClass",
      "http://example.com/directRecursiveProperty",
    ],
    [
      "http://example.com/IndirectRecursiveClass",
      "http://example.com/indirectRecursiveHelperProperty",
    ],
    [
      "http://example.com/RecursiveClassUnionMember1",
      "http://example.com/recursiveClassUnionMember1Property",
    ],
    [
      "http://example.com/RecursiveClassUnionMember2",
      "http://example.com/recursiveClassUnionMember2Property",
    ],
  ]) {
    it(`${classIri} property ${recursivePropertyIri} should be marked recursive`, ({
      expect,
    }) => {
      const astObjectType = astObjectTypesByIri[classIri];
      expect(astObjectType).toBeDefined();
      const recursiveProperty = astObjectType.properties.find(
        (property) => property.path.iri.value === recursivePropertyIri,
      );
      expect(recursiveProperty).toBeDefined();
      expect(recursiveProperty!.recursive).toStrictEqual(true);
    });
  }
});
