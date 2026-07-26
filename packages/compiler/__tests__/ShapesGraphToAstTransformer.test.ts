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
            expect(namedObjectTypes).toHaveLength(52);
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
    for (const [idString, testShapesGraph] of Object.entries(
      testShapesGraphs,
    )) {
      if (testShapesGraph.kind !== "error") {
        continue;
      }
      const id = idString as keyof typeof testShapesGraphs;

      if (id === "undefinedShape") {
        continue;
      }

      it(id, async ({ expect }) => {
        const error = new ShapesGraphToAstTransformer({
          logger,
          shapesGraph: (
            await parseTestShapesGraph(testShapesGraph)
          ).unsafeCoerce(),
        })
          .transform()
          .extract();
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;

        switch (id) {
          case "defaultValueHasValueConflict":
            expect(errorMessage).includes(
              "default value conflicts with has-value",
            );
            break;
          case "defaultValueInConflict":
            expect(errorMessage).includes(
              "default value conflicts with in value",
            );
            break;
          case "defaultValueMultipleHasValues":
            expect(errorMessage).includes(
              "default value and multiple has-values",
            );
            break;
          case "ignoredNodeShapeReference":
            expect(errorMessage).includes("reference to ignored");
            break;
          case "inversePathNodeKindConflict":
            expect(errorMessage).includes("inverse paths can only");
            break;
          case "noRequiredProperty":
            expect(errorMessage).includes("no required properties");
            break;
          case "compilerInput":
          case "featureCombinations":
          case "graphqlExample":
          case "empty":
          case "kitchenSinkExample":
          case "nodeShapeNameConflicts":
          case "objectDiscriminantProperty":
          case "propertyShapeNameConflicts":
          case "shaclShacl":
          case "syntax":
            throw new RangeError(id);
          default:
            id satisfies never;
            throw new RangeError(id);
        }
      });
    }
  });
});
