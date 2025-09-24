import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import N3 from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as ast from "../ast/index.js";
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

function synthesizeStubAstObjectType({
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
      syntheticName = "NamedDefaultStub";
      break;
    case 2:
      syntheticName = "DefaultStub";
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

function transformPropertyShapeToAstCardinalityType(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
): Either<Error, ast.CardinalityType<ast.CardinalityType.ItemType>> {
  const itemTypeEither = this.transformShapeToAstType(
    propertyShape,
    new ShapeStack(),
  );
  if (itemTypeEither.isLeft()) {
    return itemTypeEither;
  }
  const itemType = itemTypeEither.unsafeCoerce();
  invariant(ast.CardinalityType.isItemType(itemType));

  if (propertyShape.defaultValue.isJust()) {
    return Either.of({ itemType, kind: "PlainType" });
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
    return Either.of({ itemType, kind: "PlainType" });
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

  const cardinalityTypeEither =
    transformPropertyShapeToAstCardinalityType.bind(this)(propertyShape);
  if (cardinalityTypeEither.isLeft()) {
    return cardinalityTypeEither;
  }
  const cardinalityType = cardinalityTypeEither.unsafeCoerce();

  let stubType: ast.ObjectType.Property["stubType"] = Maybe.empty();
  let propertyShapeStubItemType:
    | ast.ObjectType
    | ast.ObjectUnionType
    | undefined;
  if (propertyShape.stub.isJust()) {
    const propertyShapeStubTypeEither = this.transformNodeShapeToAstType(
      propertyShape.stub.unsafeCoerce(),
    ).chain((propertyShapeStubType) => {
      switch (propertyShapeStubType.kind) {
        case "ListType":
        case "ObjectIntersectionType":
          return Left(
            new Error(
              `${propertyShape} stub cannot refer to a ${propertyShapeStubType.kind}`,
            ),
          );
        case "ObjectType":
        case "ObjectUnionType":
          return Either.of<Error, ast.ObjectType | ast.ObjectUnionType>(
            propertyShapeStubType,
          );
      }
    });
    if (propertyShapeStubTypeEither.isLeft()) {
      return propertyShapeStubTypeEither;
    }
    propertyShapeStubItemType = propertyShapeStubTypeEither.unsafeCoerce();
  }

  if (propertyShapeStubItemType || propertyShape.lazy.orDefault(false)) {
    switch (cardinalityType.itemType.kind) {
      case "ObjectType":
      case "ObjectUnionType": {
        const stubItemType =
          propertyShapeStubItemType ??
          synthesizeStubAstObjectType({
            identifierNodeKinds: identifierNodeKinds(cardinalityType.itemType),
            tsFeatures: cardinalityType.itemType.tsFeatures,
          });
        switch (cardinalityType.kind) {
          case "OptionType":
            stubType = Maybe.of({
              kind: "OptionType",
              itemType: stubItemType,
            });
            break;
          case "PlainType":
            stubType = Maybe.of({
              kind: "PlainType",
              itemType: stubItemType,
            });
            break;
          case "SetType":
            stubType = Maybe.of({
              kind: "SetType",
              itemType: stubItemType,
              minCount: 0,
              mutable: Maybe.empty(),
            });
            break;
        }
        break;
      }
      default:
        return Left(
          new Error(
            `${propertyShape} marked lazy but has ${cardinalityType.kind} of ${cardinalityType.itemType.kind}`,
          ),
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
    stubType,
    type: cardinalityType,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.identifier,
    property,
  );
  return Either.of(property);
}
