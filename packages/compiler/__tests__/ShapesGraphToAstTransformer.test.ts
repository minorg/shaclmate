import {
  // biome-ignore lint/correctness/noUnusedImports: ast gets removed for no reason
  type ast,
  ShapesGraphToAstTransformer,
} from "@shaclmate/compiler";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import { testData } from "./testData.js";

describe("ShapesGraphToAstTransformer: well-formed", () => {
  for (const [id, shapesGraphEither] of Object.entries(
    testData.shapesGraphs.wellFormed,
  )) {
    if (shapesGraphEither === null) {
      continue;
    }

    describe(id, () => {
      let ast: ast.Ast;
      const astObjectTypesByShapeIdentifier: Record<string, ast.ObjectType> =
        {};

      beforeAll(() => {
        ast = new ShapesGraphToAstTransformer({
          shapesGraph: shapesGraphEither.unsafeCoerce(),
        })
          .transform()
          .unsafeCoerce();
        for (const astObjectType of ast.objectTypes) {
          if (astObjectType.shapeIdentifier.termType !== "NamedNode") {
            continue;
          }
          invariant(
            !astObjectTypesByShapeIdentifier[
              astObjectType.shapeIdentifier.value
            ],
          );
          astObjectTypesByShapeIdentifier[astObjectType.shapeIdentifier.value] =
            astObjectType;
        }
      });

      it("should transform object types", ({ expect }) => {
        if (id === "kitchenSink") {
          expect(ast.objectTypes).toHaveLength(84);
        } else {
          expect(ast.objectTypes).not.toHaveLength(0);
        }
      });

      it("should transform named intersection types", ({ expect }) => {
        expect(ast.namedIntersectionTypes).toHaveLength(0);
      });

      it("should transform named union types", ({ expect }) => {
        if (id === "kitchenSink") {
          expect(ast.namedUnionTypes).toHaveLength(12);
        }
      });

      if (id === "kitchenSink") {
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
              (property) =>
                property.path.termType === "NamedNode" &&
                property.path.value === recursivePropertyIri,
            );
            expect(recursiveProperty).toBeDefined();
            expect(recursiveProperty!.recursive).toStrictEqual(true);
          });
        }
      }
    });
  }
});

describe("ShapesGraphToAstTransformer: illFormed", () => {
  it("sh:defaultValue and sh:hasValue conflict", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.defaultValueHasValueConflict.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes(
      "default value conflicts with has-value",
    );
  });

  it("sh:defaultValue and multiple sh:hasValue", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.defaultValueMultipleHasValues.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes(
      "default value and multiple has-values",
    );
  });

  it("sh:defaultValue and sh:in conflict", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.defaultValueInConflict.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes(
      "default value conflicts with in value",
    );
  });

  it("incompatible node shape identifiers", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.incompatibleNodeShapeIdentifiers.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).includes("not in its parent's");
  });

  it("no required property property", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.noRequiredProperty.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    invariant(error instanceof Error);
    expect(error.message).includes("no required properties");
  });

  it("undefined parent class", ({ expect }) => {
    const error = new ShapesGraphToAstTransformer({
      shapesGraph:
        testData.shapesGraphs.illFormed.undefinedParentClass.unsafeCoerce(),
    })
      .transform()
      .extract();
    expect(error).toBeInstanceOf(Error);
    invariant(error instanceof Error);
    expect(error.message).includes("no such node shape");
  });
});
