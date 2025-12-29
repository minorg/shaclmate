import { DataFactory } from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/index.js";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { ShapeStack } from "./ShapeStack.js";
import { transformShapeToAstAbstractTypeProperties } from "./transformShapeToAstAbstractTypeProperties.js";

function synthesizePartialAstObjectType({
  identifierType,
  tsFeatures,
}: {
  identifierType: ast.IdentifierType;
  tsFeatures: ReadonlySet<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierType.nodeKinds.size) {
    case 1:
      invariant(identifierType.nodeKinds.has("NamedNode"));
      syntheticName = "NamedDefaultPartial";
      break;
    case 2:
      syntheticName = "DefaultPartial";
      break;
    default:
      throw new Error("should never happen");
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
    shapeIdentifier: DataFactory.namedNode(
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
  const itemTypeEither = this.transformShapeToAstType(
    propertyShape,
    new ShapeStack(),
  );
  if (itemTypeEither.isLeft()) {
    return itemTypeEither;
  }
  const itemType = itemTypeEither.unsafeCoerce();

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

  if (propertyShape.defaultValue.isJust()) {
    if (minCount > 0) {
      return Left(
        new Error(`${propertyShape}: has sh:minCount > 0 and sh:defaultValue`),
      );
    }

    if (maxCount > 1) {
      return Left(
        new Error(
          `${propertyShape}: sets with sh:defaultValue are currently unsupported`,
        ),
      );
    }

    // If a property shape has sh:defaultValue, sh:minCount = 0, and sh:maxCount = 1,
    // treat its type as required. The generated type will fill in the sh:defaultValue on
    // construction/deserialization.

    return Either.of(itemType);
  }

  if (minCount === 0 && maxCount === 1) {
    return Either.of(
      new ast.OptionType({
        itemType,
      }),
    );
  }

  if (minCount === 1 && maxCount === 1) {
    return Either.of(itemType);
  }

  return Either.of(
    new ast.SetType({
      itemType,
      minCount,
      mutable: propertyShape.mutable.orDefault(false),
    }),
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
  const typeEither = transformPropertyShapeToAstType.bind(this)(propertyShape);
  if (typeEither.isLeft()) {
    return typeEither;
  }
  let type = typeEither.unsafeCoerce();

  let propertyShapePartialItemType:
    | ast.ObjectType
    | ast.ObjectUnionType
    | undefined;
  if (propertyShape.partial.isJust()) {
    const propertyShapePartialTypeEither = this.transformNodeShapeToAstType(
      propertyShape.partial.unsafeCoerce(),
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
    switch (type.kind) {
      case "ObjectType":
      case "ObjectUnionType":
        type = new ast.LazyObjectType({
          ...transformShapeToAstAbstractTypeProperties(propertyShape),
          partialType:
            propertyShapePartialItemType ??
            synthesizePartialAstObjectType({
              identifierType: type.identifierType,
              tsFeatures: type.tsFeatures,
            }),
          resolvedType: type,
        });
        break;
      case "OptionType":
      case "SetType": {
        switch (type.itemType.kind) {
          case "ObjectType":
          case "ObjectUnionType":
            break;
          default:
            return Left(
              new Error(
                `${propertyShape} marked lazy but has ${type.kind} of ${type.itemType.kind}`,
              ),
            );
        }

        const partialItemType =
          propertyShapePartialItemType ??
          synthesizePartialAstObjectType({
            identifierType: type.itemType.identifierType,
            tsFeatures: type.itemType.tsFeatures,
          });
        switch (type.kind) {
          case "OptionType":
            type = new ast.LazyObjectOptionType({
              ...transformShapeToAstAbstractTypeProperties(propertyShape),
              partialType: new ast.OptionType({
                itemType: partialItemType,
              }),
              resolvedType: type as ast.OptionType<
                ast.ObjectType | ast.ObjectUnionType
              >,
            });
            break;
          case "SetType":
            type = new ast.LazyObjectSetType({
              ...transformShapeToAstAbstractTypeProperties(propertyShape),
              partialType: new ast.SetType({
                itemType: partialItemType,
                minCount: 0,
                mutable: false,
              }),
              resolvedType: type as ast.SetType<
                ast.ObjectType | ast.ObjectUnionType
              >,
            });
            break;
        }
        break;
      }
      default:
        return Left(
          new Error(`${propertyShape} marked lazy but has ${type.kind}`),
        );
    }
  }

  const path = propertyShape.path;
  if (path.kind !== "PredicatePath") {
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
      type,
      visibility: propertyShape.visibility,
    }),
  );
}
