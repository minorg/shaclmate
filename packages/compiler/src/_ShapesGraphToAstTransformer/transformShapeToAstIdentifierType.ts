import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { Either, Left } from "purify-ts";
import * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { createIdentifierType } from "./createIdentifierType.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

type R =
  | ast.DefaultValueType<ast.IdentifierType | ast.NamedNodeType>
  | ast.BlankNodeType
  | ast.IdentifierType
  | ast.NamedNodeType;

/**
 * Try to convert a property shape to an AST IdentifierType using some heuristics.
 */
export function transformShapeToAstIdentifierType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, R> {
  shapeStack.push(shape);
  try {
    // defaultValue / hasValue / in only makes sense with IRIs
    const identifierDefaultValue = shapeStack.defaultValue.filter(
      (value) => value.termType === "NamedNode",
    );
    const identifierHasValues = shapeStack.constraints.hasValues.filter(
      (term) => term.termType === "NamedNode",
    ) as readonly NamedNode[];
    const identifierIn = shapeStack.constraints.in_.filter(
      (term) => term.termType === "NamedNode",
    );

    return shapeNodeKinds(shape).chain((nodeKinds) => {
      if (
        identifierHasValues.length > 0 ||
        identifierDefaultValue.isJust() ||
        identifierIn.length > 0 ||
        (nodeKinds.size > 0 && nodeKinds.size <= 2 && !nodeKinds.has("Literal"))
      ) {
        return transformShapeToAstAbstractTypeProperties(shape).chain(
          (astAbstractTypeProperties) => {
            const identifierType = createIdentifierType(
              nodeKinds as ReadonlySet<IdentifierNodeKind>,
              {
                ...astAbstractTypeProperties,
                hasValues: identifierHasValues,
                in_: identifierIn,
              },
            );

            return identifierDefaultValue
              .map((defaultValue) => {
                if (identifierType.kind === "BlankNodeType") {
                  return Left(
                    new Error(
                      `${shape}: blank node identifier types cannot have default values`,
                    ),
                  );
                }

                return Either.of<Error, R>(
                  new ast.DefaultValueType<
                    ast.IdentifierType | ast.NamedNodeType
                  >({ defaultValue, itemType: identifierType }) as
                    | ast.DefaultValueType<
                        ast.IdentifierType | ast.NamedNodeType
                      >
                    | ast.BlankNodeType
                    | ast.IdentifierType
                    | ast.NamedNodeType,
                );
              })
              .orDefault(Either.of<Error, R>(identifierType));
          },
        );
      }

      return Left(new Error(`unable to transform ${shape} into an AST type`));
    });
  } finally {
    shapeStack.pop(shape);
  }
}
