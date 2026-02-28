import { Either, Left } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type { ShapeStack } from "./ShapeStack.js";
import { shapeNodeKinds } from "./shapeNodeKinds.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

type AstTermType =
  | ast.BlankNodeType
  | ast.DefaultValueType<
      ast.IdentifierType | ast.LiteralType | ast.IriType | ast.TermType
    >
  | ast.IdentifierType
  | ast.IriType
  | ast.LiteralType
  | ast.TermType;

/**
 * Try to convert a shape to an AST TermType using some heuristics.
 */
export function transformShapeToAstTermType(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
  shapeStack: ShapeStack,
): Either<Error, AstTermType> {
  shapeStack.push(shape);
  try {
    return Eithers.chain2(
      transformShapeToAstAbstractTypeProperties(shape),
      shapeNodeKinds(shape),
    ).chain(([astAbstractTypeProperties, nodeKinds]) => {
      const hasValues = shapeStack.constraints.hasValues;
      const in_ = shapeStack.constraints.in_;

      let termType:
        | ast.BlankNodeType
        | ast.IdentifierType
        | ast.IriType
        | ast.LiteralType
        | ast.TermType;

      if (nodeKinds.size === 1) {
        const nodeKind = [...nodeKinds][0];
        switch (nodeKind) {
          case "BlankNode":
            invariant(in_.length === 0);
            termType = new ast.BlankNodeType({
              ...astAbstractTypeProperties,
            });
            break;
          case "Literal":
            termType = new ast.LiteralType({
              ...astAbstractTypeProperties,
              datatype: shape.constraints.datatype,
              hasValues: hasValues.filter((_) => _.termType === "Literal"),
              in_: in_.filter((_) => _.termType === "Literal"),
              languageIn: [...new Set(shape.constraints.languageIn)],
              maxExclusive: shape.constraints.maxExclusive,
              maxInclusive: shape.constraints.maxInclusive,
              minExclusive: shape.constraints.minExclusive,
              minInclusive: shape.constraints.minInclusive,
            });
            break;
          case "NamedNode":
            termType = new ast.IriType({
              ...astAbstractTypeProperties,
              hasValues: hasValues.filter((_) => _.termType === "NamedNode"),
              in_: in_.filter((_) => _.termType === "NamedNode"),
            });
            break;
        }
      } else if (
        nodeKinds.size === 2 &&
        nodeKinds.has("BlankNode") &&
        nodeKinds.has("NamedNode")
      ) {
        invariant(in_.length === 0);
        termType = new ast.IdentifierType({
          ...astAbstractTypeProperties,
        });
      } else {
        invariant(nodeKinds.size >= 2 && nodeKinds.has("Literal"));
        termType = new ast.TermType({
          ...astAbstractTypeProperties,
          hasValues,
          in_,
          nodeKinds,
        });
      }

      if (termType.in_.length > 0) {
        for (const hasValue of termType.hasValues) {
          if (!termType.in_.some((in_) => hasValue.equals(in_))) {
            return Left(new Error(`${shape}: has-value conflicts with in`));
          }
        }
      }

      return shapeStack.defaultValue
        .map((defaultValue) => {
          switch (termType.kind) {
            case "BlankNodeType":
              return Left(
                new Error(
                  `${shape}: blank node identifier types cannot have default values`,
                ),
              );
          }

          switch (termType.hasValues.length) {
            case 0:
              break;
            case 1:
              if (!termType.hasValues[0].equals(defaultValue)) {
                return Left(
                  new Error(`${shape}: default value conflicts with has-value`),
                );
              }
              break;
            default:
              return Left(
                new Error(
                  `${shape}: has a default value and multiple has-values`,
                ),
              );
          }

          if (
            termType.in_.length > 0 &&
            !termType.in_.some((in_) => in_.equals(defaultValue))
          ) {
            return Left(
              new Error(`${shape}: default value conflicts with in value`),
            );
          }

          return Either.of<Error, AstTermType>(
            new ast.DefaultValueType({
              defaultValue,
              itemType: termType,
            }) as AstTermType,
          );
        })
        .orDefault(Either.of<Error, AstTermType>(termType));
    });
  } finally {
    shapeStack.pop(shape);
  }
}
