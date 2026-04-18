import dataFactory from "@rdfjs/data-model";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { AbstractContainerType } from "../ast/AbstractContainerType.js";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { shapeIdentifier } from "./shapeIdentifier.js";
import { shapeName } from "./shapeName.js";
import { transformShapeToAstObjectType } from "./transformShapeToAstObjectType.js";
import { transformShapeToAstType } from "./transformShapeToAstType.js";

function synthesizePartialAstObjectType({
  identifierType,
  tsFeatures,
}: {
  identifierType: ast.BlankNodeType | ast.IdentifierType | ast.IriType;
  tsFeatures: ReadonlySet<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierType.kind) {
    case "BlankNodeType":
      throw new Error("should never happen");
    case "IdentifierType":
      syntheticName = "DefaultPartial";
      break;
    case "IriType":
      syntheticName = "NamedDefaultPartial";
      break;
  }

  return new ast.ObjectType({
    abstract: false,
    comment: Maybe.empty(),
    export_: true,
    extern: false,
    fromRdfType: Maybe.empty(),
    identifierType,
    identifierMintingStrategy: Maybe.empty(),
    label: Maybe.empty(),
    name: Maybe.of(syntheticName),
    shapeIdentifier: dataFactory.namedNode(
      `urn:shaclmate:synthetic:${syntheticName}`,
    ),
    synthetic: true,
    toRdfTypes: [],
    tsFeatures,
    tsImports: [],
    tsObjectDeclarationType: "class",
  });
}

function transformPropertyShapeToAstType(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
): Either<Error, ast.Type> {
  // if (
  //   propertyShape.path.kind === "PredicatePath" &&
  //   propertyShape.path.iri.value.endsWith("termProperty")
  // ) {
  // }

  return transformShapeToAstType
    .call(this, propertyShape, new ShapeStack())
    .chain((propertyShapeAstType) => {
      let maxCount = propertyShape.constraints.maxCount.orDefault(
        Number.MAX_SAFE_INTEGER,
      );
      let minCount = propertyShape.constraints.minCount.orDefault(0);
      if (minCount < 0) {
        minCount = 0;
      }
      if (propertyShape.constraints.hasValues.length > minCount) {
        minCount = propertyShape.constraints.hasValues.length;
      }
      if (maxCount < minCount) {
        maxCount = minCount;
      }

      if (propertyShapeAstType.kind === "DefaultValueType") {
        if (minCount > 0) {
          return Left(
            new Error(
              `${propertyShape}: has sh:minCount > 0 and sh:defaultValue`,
            ),
          );
        }

        if (maxCount > 1) {
          return Left(
            new Error(
              `${propertyShape}: sets with sh:defaultValue are currently unsupported`,
            ),
          );
        }

        return Either.of(propertyShapeAstType);
      }

      if (minCount === 1 && maxCount === 1) {
        return Either.of(propertyShapeAstType);
      }

      if (minCount === 0 && maxCount === 1) {
        if (!ast.OptionType.isItemType(propertyShapeAstType)) {
          return Left(
            new Error(
              `${propertyShape}: ${propertyShapeAstType} is not an OptionType item type`,
            ),
          );
        }

        return Either.of(
          new ast.OptionType({
            itemType: propertyShapeAstType,
          }),
        );
      }

      if (!ast.SetType.isItemType(propertyShapeAstType)) {
        return Left(
          new Error(
            `${propertyShape}: ${propertyShapeAstType} is not a SetType item type`,
          ),
        );
      }
      return Either.of(
        new ast.SetType({
          itemType: propertyShapeAstType,
          minCount,
          mutable: propertyShape.mutable.orDefault(false),
        }),
      );
    });
}

export function transformPropertyShapeToAstObjectTypeProperty(
  this: ShapesGraphToAstTransformer,
  {
    objectType,
    propertyShape,
  }: {
    objectType: ast.ObjectType;
    propertyShape: input.PropertyShape;
  },
): Either<Error, ast.ObjectType.Property> {
  return Eithers.chain2(
    propertyShape.resolve,
    transformPropertyShapeToAstType.call(this, propertyShape),
  ).chain(([propertyShapeResolve, astType]) => {
    let astResolveItemType: ast.ObjectType | ast.ObjectUnionType | undefined;

    if (propertyShapeResolve.isJust()) {
      const astResolveTypeEither = transformShapeToAstObjectType
        .call(this, propertyShapeResolve.unsafeCoerce())
        .chain((astResolveType) => {
          switch (astResolveType.kind) {
            case "ObjectType":
              return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
                astResolveType,
              );
            case "UnionType":
              if (!astResolveType.isObjectUnionType()) {
                return Left(
                  new Error(
                    `${propertyShape} resolve cannot refer to a ${astResolveType.kind} with non-ObjectType members`,
                  ),
                );
              }
              return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
                astResolveType,
              );
            default:
              return Left(
                new Error(
                  `${propertyShape} resolve cannot refer to a ${astResolveType.kind}`,
                ),
              );
          }
        });
      if (astResolveTypeEither.isLeft()) {
        return astResolveTypeEither;
      }
      astResolveItemType = astResolveTypeEither.unsafeCoerce();
    }

    if (astResolveItemType) {
      let astItemType: AbstractContainerType.ItemType;
      switch (astType.kind) {
        case "DefaultValueType":
        case "OptionType":
        case "SetType":
          astItemType = astType.itemType;
          break;
        case "LazyObjectOptionType":
        case "LazyObjectSetType":
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: break is unreachable
        case "LazyObjectType":
          invariant(
            false,
            `lazy types should not appear here: ${astType.kind}`,
          );
        default:
          astItemType = astType;
          break;
      }

      let astPartialItemType: ast.ObjectType | ast.ObjectUnionType;
      switch (astItemType.kind) {
        case "BlankNodeType":
        case "IdentifierType":
        case "IriType":
          astPartialItemType = synthesizePartialAstObjectType({
            identifierType: astItemType,
            tsFeatures: astResolveItemType.tsFeatures,
          });
          break;
        case "ObjectType":
          astPartialItemType = astItemType;
          break;
        case "UnionType":
          if (!astItemType.isObjectUnionType()) {
            return Left(
              new Error(
                `${propertyShape} partial type cannot be a ${astItemType.kind} with non-ObjectType members`,
              ),
            );
          }
          astPartialItemType = astItemType;
          break;
        default:
          return Left(
            new Error(
              `${propertyShape} has a resolve with an incompatible partial type ${astItemType.kind}`,
            ),
          );
      }

      const astAbstractTypeProperties = {
        comment: Maybe.empty(),
        label: Maybe.empty(),
        name: Maybe.empty(),
        shapeIdentifier: shapeIdentifier.call(this, propertyShape),
      };

      switch (astType.kind) {
        case "BlankNodeType":
        case "IdentifierType":
        case "IriType":
        case "ObjectType":
        case "UnionType":
          astType = new ast.LazyObjectType({
            ...astAbstractTypeProperties,
            partialType: astPartialItemType,
            resolveType: astResolveItemType,
          });
          break;
        case "OptionType":
          astType = new ast.LazyObjectOptionType({
            ...astAbstractTypeProperties,
            partialType: new ast.OptionType({
              itemType: astPartialItemType,
            }),
            resolveType: new ast.OptionType({
              itemType: astResolveItemType,
            }),
          });
          break;
        case "SetType":
          astType = new ast.LazyObjectSetType({
            ...astAbstractTypeProperties,
            partialType: new ast.SetType({
              itemType: astPartialItemType,
              minCount: 0,
              mutable: false,
            }),
            resolveType: new ast.SetType({
              itemType: astResolveItemType,
              minCount: 0,
              mutable: false,
            }),
          });
          break;
        default:
          invariant(false, `unexpected lazy AST type ${astType.kind}`);
      }
    }

    return Either.of(
      new ast.ObjectType.Property({
        comment: propertyShape.comment,
        description: propertyShape.description,
        label: propertyShape.label,
        mutable: propertyShape.mutable.orDefault(false),
        name: shapeName(propertyShape),
        objectType,
        order: propertyShape.order.orDefault(0),
        path:
          (propertyShape.path.termType === "NamedNode"
            ? this.curieFactory.create(propertyShape.path).extract()
            : undefined) ?? propertyShape.path,
        shapeIdentifier:
          (propertyShape.identifier.termType === "NamedNode"
            ? this.curieFactory.create(propertyShape.identifier).extract()
            : undefined) ?? propertyShape.identifier,
        type: astType,
        visibility: propertyShape.visibility,
      }),
    );
  });
}
