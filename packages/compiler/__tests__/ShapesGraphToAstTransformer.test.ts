import {
  // biome-ignore lint/correctness/noUnusedImports: ast gets removed for no reason
  type ast,
  ShapesGraphToAstTransformer,
} from "@shaclmate/compiler";
import { invariant } from "ts-invariant";
import { beforeAll, describe, it } from "vitest";
import { testShapesGraphs } from "../../../test-shapes-graphs/index.js";
import { logger } from "./logger.js";
import { parseTestShapesGraph } from "./parseTestShapesGraph.js";

describe("ShapesGraphToAstTransformer", () => {
  describe("well-formed", () => {
    for (const [id, testShapesGraph] of Object.entries(testShapesGraphs)) {
      if (
        testShapesGraph.kind === "error" ||
        testShapesGraph.kind === "stress"
      ) {
        continue;
      }

      describe(id, () => {
        let ast: ast.Ast;
        const astStructTypesByShapeIdentifier: Record<string, ast.StructType> =
          {};

        beforeAll(async () => {
          ast = new ShapesGraphToAstTransformer({
            logger,
            shapesGraph: (
              await parseTestShapesGraph(testShapesGraph)
            ).unsafeCoerce(),
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
            expect(namedObjectTypes).toHaveLength(51);
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
          const namedDiscriminatedUnionTypes = ast.namedTypes.filter(
            (_) => _.kind === "DiscriminatedUnion",
          );
          if (id === "kitchenSinkExample") {
            expect(namedDiscriminatedUnionTypes).toHaveLength(8);
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
              "http://example.com/RecursiveDiscriminatedUnionMember1",
              "http://example.com/recursiveDiscriminatedUnionMember1Property",
            ],
            [
              "http://example.com/RecursiveDiscriminatedUnionMember2",
              "http://example.com/recursiveDiscriminatedUnionMember2Property",
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
    it("sh:defaultValue and sh:hasValue conflict", async ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(
            testShapesGraphs.defaultValueHasValueConflict,
          )
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes(
        "default value conflicts with has-value",
      );
    });

    it("sh:defaultValue and multiple sh:hasValue", async ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(
            testShapesGraphs.defaultValueMultipleHasValues,
          )
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes(
        "default value and multiple has-values",
      );
    });

    it("sh:defaultValue and sh:in conflict", async ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(testShapesGraphs.defaultValueInConflict)
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes(
        "default value conflicts with in value",
      );
    });

    it("ignored node shape reference", async ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(testShapesGraphs.ignoredNodeShapeReference)
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("reference to ignored");
    });

    it("inverse paths can only have blank or IRI node kinds", async ({
      expect,
    }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(
            testShapesGraphs.inversePathNodeKindConflict,
          )
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).includes("inverse paths can only");
    });

    it("no required property property", async ({ expect }) => {
      const error = new ShapesGraphToAstTransformer({
        logger,
        shapesGraph: (
          await parseTestShapesGraph(testShapesGraphs.noRequiredProperty)
        ).unsafeCoerce(),
      })
        .transform()
        .extract();
      expect(error).toBeInstanceOf(Error);
      invariant(error instanceof Error);
      expect(error.message).includes("no required properties");
    });
  });
});
