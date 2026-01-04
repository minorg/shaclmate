// biome-ignore lint/correctness/noUnusedImports: ast gets removed for no reason
import { type ast, ShapesGraphToAstTransformer } from "@shaclmate/compiler";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import { testData } from "./testData.js";

describe("ShapesGraphToAstTransformer: kitchen sink", () => {
  let ast: ast.Ast;
  const astObjectTypesByShapeIdentifier: Record<string, ast.ObjectType> = {};

  beforeAll(() => {
    ast = new ShapesGraphToAstTransformer(testData.kitchenSink.unsafeCoerce())
      .transform()
      .unsafeCoerce();
    for (const astObjectType of ast.objectTypes) {
      if (astObjectType.shapeIdentifier.termType !== "NamedNode") {
        continue;
      }
      invariant(
        !astObjectTypesByShapeIdentifier[astObjectType.shapeIdentifier.value],
      );
      astObjectTypesByShapeIdentifier[astObjectType.shapeIdentifier.value] =
        astObjectType;
    }
  });

  it("should transform kitchen object types", ({ expect }) => {
    expect(ast.objectTypes).toHaveLength(74);
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
      const astObjectType = astObjectTypesByShapeIdentifier[classIri];
      expect(astObjectType).toBeDefined();
      const recursiveProperty = astObjectType.properties.find(
        (property) => property.path.value === recursivePropertyIri,
      );
      expect(recursiveProperty).toBeDefined();
      expect(recursiveProperty!.recursive).toStrictEqual(true);
    });
  }
});

describe("ShapesGraphToAstTransformer: error cases", () => {
  it("incompatible node shape identifiers", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer(
      testData.incompatibleNodeShapeIdentifiers.unsafeCoerce(),
    )
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes("not in its parent's");
  });

  it("undefined parent class", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer(
      testData.undefinedParentClass.unsafeCoerce(),
    )
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    invariant(error instanceof Error);
    expect(error.message).includes("not in its parent's");
  });
});
