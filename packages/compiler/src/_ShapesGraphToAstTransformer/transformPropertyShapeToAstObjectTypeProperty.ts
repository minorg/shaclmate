import dataFactory from "@rdfjs/data-model";
import { Either, Left, Maybe } from "purify-ts";
import * as ast from "../ast/index.js";
import { Eithers } from "../Eithers.js";
import type { TsFeature } from "../enums/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

function synthesizePartialAstObjectType({
  identifierType,
  tsFeatures,
}: {
  identifierType: ast.BlankNodeType | ast.IdentifierType | ast.NamedNodeType;
  tsFeatures: ReadonlySet<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierType.kind) {
    case "BlankNodeType":
      throw new Error("should never happen");
    case "IdentifierType":
      syntheticName = "DefaultPartial";
      break;
    case "NamedNodeType":
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

  return this.transformShapeToAstType(propertyShape, new ShapeStack()).chain(
    (propertyShapeAstType) => {
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
    },
  );
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
  return Eithers.chain3(
    transformShapeToAstAbstractTypeProperties(propertyShape),
    propertyShape.partial,
    transformPropertyShapeToAstType.bind(this)(propertyShape),
  ).chain(
    ([astAbstractTypeProperties, propertyShapePartial, propertyShapeType]) => {
      let propertyShapePartialItemType:
        | ast.ObjectType
        | ast.ObjectUnionType
        | undefined;

      if (propertyShapePartial.isJust()) {
        const propertyShapePartialTypeEither = this.transformNodeShapeToAstType(
          propertyShapePartial.unsafeCoerce(),
        ).chain((propertyShapePartialType) => {
          switch (propertyShapePartialType.kind) {
            case "ListType":
            case "ObjectIntersectionType":
              return Left(
                new Error(
                  `${propertyShape} partial cannot refer to a ${propertyShapePartialType.kind}`,
                ),
              );
            case "ObjectType":
            case "ObjectUnionType":
              return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
                propertyShapePartialType,
              );
          }
        });
        if (propertyShapePartialTypeEither.isLeft()) {
          return propertyShapePartialTypeEither;
        }
        propertyShapePartialItemType =
          propertyShapePartialTypeEither.unsafeCoerce();
      }

      if (propertyShapePartialItemType || propertyShape.lazy.orDefault(false)) {
        switch (propertyShapeType.kind) {
          case "ObjectType":
          case "ObjectUnionType":
            propertyShapeType = new ast.LazyObjectType({
              ...astAbstractTypeProperties,
              partialType:
                propertyShapePartialItemType ??
                synthesizePartialAstObjectType({
                  identifierType: propertyShapeType.identifierType,
                  tsFeatures: propertyShapeType.tsFeatures,
                }),
              resolvedType: propertyShapeType,
            });
            break;
          case "OptionType":
          case "SetType": {
            switch (propertyShapeType.itemType.kind) {
              case "ObjectType":
              case "ObjectUnionType":
                break;
              default:
                return Left(
                  new Error(
                    `${propertyShape} marked lazy but has ${propertyShapeType.kind} of ${propertyShapeType.itemType.kind}`,
                  ),
                );
            }

            const partialItemType =
              propertyShapePartialItemType ??
              synthesizePartialAstObjectType({
                identifierType: propertyShapeType.itemType.identifierType,
                tsFeatures: propertyShapeType.itemType.tsFeatures,
              });
            switch (propertyShapeType.kind) {
              case "OptionType":
                propertyShapeType = new ast.LazyObjectOptionType({
                  ...astAbstractTypeProperties,
                  partialType: new ast.OptionType({
                    itemType: partialItemType,
                  }),
                  resolvedType: propertyShapeType as ast.OptionType<
                    ast.ObjectType | ast.ObjectUnionType
                  >,
                });
                break;
              case "SetType":
                propertyShapeType = new ast.LazyObjectSetType({
                  ...astAbstractTypeProperties,
                  partialType: new ast.SetType({
                    itemType: partialItemType,
                    minCount: 0,
                    mutable: false,
                  }),
                  resolvedType: propertyShapeType as ast.SetType<
                    ast.ObjectType | ast.ObjectUnionType
                  >,
                });
                break;
            }
            break;
          }
          default:
            return Left(
              new Error(
                `${propertyShape} marked lazy but has ${propertyShapeType.kind}`,
              ),
            );
        }
      }

      const path = propertyShape.path;
      if (path.$type !== "PredicatePath") {
        return Left(
          new Error(`${propertyShape} has non-predicate path, unsupported`),
        );
      }

      return Either.of(
        new ast.ObjectType.Property({
          comment: propertyShape.comment,
          description: propertyShape.description,
          label: propertyShape.label,
          mutable: propertyShape.mutable.orDefault(false),
          name: propertyShape.shaclmateName.alt(propertyShape.name),
          objectType,
          order: propertyShape.order.orDefault(0),
          path: this.curieFactory.create(path.iri).extract() ?? path.iri,
          shapeIdentifier:
            (propertyShape.identifier.termType === "NamedNode"
              ? this.curieFactory.create(propertyShape.identifier).extract()
              : undefined) ?? propertyShape.identifier,
          type: propertyShapeType,
          visibility: propertyShape.visibility,
        }),
      );
    },
  );
}
