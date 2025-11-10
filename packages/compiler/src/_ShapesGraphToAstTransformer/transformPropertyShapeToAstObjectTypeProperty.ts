import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import N3 from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/index.js";
import type * as input from "../input/index.js";
import { ShapeStack } from "./ShapeStack.js";
import { pickLiteral } from "./pickLiteral.js";

function identifierNodeKinds(
  type: ast.ObjectType | ast.ObjectUnionType,
): Set<IdentifierNodeKind> {
  switch (type.kind) {
    case "ObjectType":
      return type.identifierNodeKinds;
    case "ObjectUnionType":
      return new Set(
        type.memberTypes.flatMap((memberType) => [
          ...memberType.identifierNodeKinds,
        ]),
      );
  }
}

function synthesizePartialAstObjectType({
  identifierNodeKinds,
  tsFeatures,
}: {
  identifierNodeKinds: Set<IdentifierNodeKind>;
  tsFeatures: Set<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierNodeKinds.size) {
    case 1:
      invariant(identifierNodeKinds.has("NamedNode"));
      syntheticName = "NamedDefaultPartial";
      break;
    case 2:
      syntheticName = "DefaultPartial";
      break;
    default:
      throw new Error("should never happen");
  }

  return {
    abstract: false,
    ancestorObjectTypes: [],
    childObjectTypes: [],
    comment: Maybe.empty(),
    descendantObjectTypes: [],
    export: true,
    extern: false,
    fromRdfType: Maybe.empty(),
    identifierIn: [],
    identifierNodeKinds,
    identifierMintingStrategy: Maybe.empty(),
    kind: "ObjectType",
    label: Maybe.empty(),
    name: {
      identifier: N3.DataFactory.blankNode(),
      label: Maybe.empty(),
      propertyPath: Maybe.empty(),
      shName: Maybe.empty(),
      shaclmateName: Maybe.empty(),
      syntheticName: Maybe.of(syntheticName),
    },
    parentObjectTypes: [],
    properties: [],
    synthetic: true,
    toRdfTypes: [],
    tsFeatures,
    tsImports: [],
    tsObjectDeclarationType: "class",
  };
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

  if (propertyShape.defaultValue.isJust()) {
    return Either.of(itemType);
  }

  if (
    propertyShape.constraints.maxCount.isNothing() &&
    propertyShape.constraints.minCount.isNothing()
  ) {
    return Either.of({
      itemType,
      kind: "SetType",
      mutable: propertyShape.mutable,
      minCount: 0,
    });
  }

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

  if (minCount === 0 && maxCount === 1) {
    return Either.of({
      itemType,
      kind: "OptionType",
    });
  }

  if (minCount === 1 && maxCount === 1) {
    return Either.of(itemType);
  }

  invariant(
    propertyShape.constraints.minCount.isJust() ||
      propertyShape.constraints.maxCount.isJust(),
  );
  return Either.of({
    itemType,
    kind: "SetType",
    minCount,
    mutable: propertyShape.mutable,
  });
}

export function transformPropertyShapeToAstObjectTypeProperty(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
): Either<Error, ast.ObjectType.Property> {
  {
    const property = this.astObjectTypePropertiesByIdentifier.get(
      propertyShape.identifier,
    );
    if (property) {
      return Either.of(property);
    }
  }

  const typeEither = transformPropertyShapeToAstType.bind(this)(propertyShape);
  if (typeEither.isLeft()) {
    return typeEither;
  }
  const type = typeEither.unsafeCoerce();

  let partialType: ast.ObjectType.Property["partialType"] = Maybe.empty();
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
        partialType = Maybe.of(
          propertyShapePartialItemType ??
            synthesizePartialAstObjectType({
              identifierNodeKinds: identifierNodeKinds(type),
              tsFeatures: type.tsFeatures,
            }),
        );
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
            identifierNodeKinds: identifierNodeKinds(type.itemType),
            tsFeatures: type.itemType.tsFeatures,
          });
        switch (type.kind) {
          case "OptionType":
            partialType = Maybe.of({
              kind: "OptionType",
              itemType: partialItemType,
            });
            break;
          case "SetType":
            partialType = Maybe.of({
              kind: "SetType",
              itemType: partialItemType,
              minCount: 0,
              mutable: Maybe.empty(),
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

  const property: ast.ObjectType.Property = {
    comment: pickLiteral(propertyShape.comments).map(
      (literal) => literal.value,
    ),
    description: pickLiteral(propertyShape.descriptions).map(
      (literal) => literal.value,
    ),
    label: pickLiteral(propertyShape.labels).map((literal) => literal.value),
    mutable: propertyShape.mutable,
    name: this.shapeAstName(propertyShape),
    order: propertyShape.order.orDefault(0),
    path,
    partialType,
    type: type,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.identifier,
    property,
  );
  return Either.of(property);
}
