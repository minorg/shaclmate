import {
  // biome-ignore lint/correctness/noUnusedImports: ast gets removed for no reason
  type ast,
  type ShapesGraph,
  ShapesGraphToAstTransformer,
} from "@shaclmate/compiler";
import type { Either } from "purify-ts";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import { logger } from "./logger.js";
import { testData } from "./testData.js";

describe("ShapesGraphToAstTransformer", () => {
  describe("well-formed", () => {
    for (const [id, shapesGraphEither] of Object.entries(
      testData.shapesGraphs.wellFormed,
    ) as [
      keyof typeof testData.shapesGraphs.wellFormed,
      Either<Error, ShapesGraph> | null,
    ][]) {
      if (shapesGraphEither === null) {
        continue;
      }

      describe(id, () => {
        let ast: ast.Ast;
        const astStructTypesByShapeIdentifier: Record<string, ast.StructType> =
          {};

        beforeAll(() => {
          ast = new ShapesGraphToAstTransformer({
            logger,
            shapesGraph: shapesGraphEither.unsafeCoerce(),
          })
            .transform()
            .unsafeCoerce();
          for (const astStructType of ast.namedTypes.filter(
            (_) => _.kind === "Struct",
          )) {
            if (astStructType.shapeIdentifier.termType !== "NamedNode") {
              continue;
            }
            invariant(
              !astStructTypesByShapeIdentifier[
                astStructType.shapeIdentifier.value
              ],
            );
            astStructTypesByShapeIdentifier[
              astStructType.shapeIdentifier.value
            ] = astStructType;
          }
        });

        it("should transform object types", ({ expect }) => {
          const namedObjectTypes = ast.namedTypes.filter(
            (_) => _.kind === "Struct",
          );
          if (id === "kitchenSinkExample") {
            expect(namedObjectTypes).toHaveLength(48);
          } else {
            expect(namedObjectTypes).not.toHaveLength(0);
          }
        });

        it("should transform named intersection types", ({ expect }) => {
          const namedIntersectionTypes = ast.namedTypes.filter(
            (_) => _.kind === "Intersection",
          );
          expect(namedIntersectionTypes).toHaveLength(0);
        });

        it("should transform named union types", ({ expect }) => {
          const namedUnionTypes = ast.namedTypes.filter(
            (_) => _.kind === "Union",
          );
          if (id === "kitchenSinkExample") {
            expect(namedUnionTypes).toHaveLength(8);
          }
        });

        if (id === "kitchenSinkExample") {
          for (const [classIri, recursivePropertyIri] of [
            [
              "http://example.com/DirectRecursiveStruct",
              "http://example.com/directRecursive",
            ],
            [
              "http://example.com/IndirectRecursiveStruct",
              "http://example.com/indirectRecursiveHelper",
            ],
            [
              "http://example.com/RecursiveUnionMember1",
              "http://example.com/recursiveUnionMember1Property",
            ],
            [
              "http://example.com/RecursiveUnionMember2",
              "http://example.com/recursiveUnionMember2Property",
            ],
          ]) {
            it(`${classIri} property ${recursivePropertyIri} should be marked recursive`, ({
              expect,
            }) => {
              const astStructType = astStructTypesByShapeIdentifier[classIri];
              expect(astStructType).toBeDefined();
              const recursiveProperty = astStructType.fields.find(
                (field) =>
                  field.path.termType === "NamedNode" &&
                  field.path.value === recursivePropertyIri,
              );
              expect(recursiveProperty).toBeDefined();
              expect(recursiveProperty!.recursive).toStrictEqual(true);
            });
          }
        }
      });
    }
  });

  describe("ill-formed", () => {
    it("sh:defaultValue and sh:hasValue conflict", ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
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
        logger,
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
        logger,
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

    it("inverse paths can only have blank or IRI node kinds", ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph:
          testData.shapesGraphs.illFormed.inversePathNodeKindConflict.unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("inverse paths can only");
    });

    it("no required property property", ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph:
          testData.shapesGraphs.illFormed.noRequiredProperty.unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      invariant(error instanceof Error);
      expect(error.message).includes("no required properties");
    });
  });
});
