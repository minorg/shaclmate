import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import N3 from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/index.js";
import type * as input from "../input/index.js";
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

  const typeEither = this.transformPropertyShapeToAstType(propertyShape, {
    defaultValue: Maybe.empty(),
    maxCount: Maybe.empty(),
    minCount: Maybe.empty(),
  });
  if (typeEither.isLeft()) {
    return typeEither;
  }
  const type = typeEither.unsafeCoerce();

  let stubType: ast.ObjectType.Property["stubType"] = Maybe.empty();
  let propertyShapeStubType: ast.ObjectType | ast.ObjectUnionType | undefined;
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
    propertyShapeStubType = propertyShapeStubTypeEither.unsafeCoerce();
  }

  if (propertyShapeStubType || propertyShape.lazy.orDefault(false)) {
    switch (type.itemType.kind) {
      case "ObjectType":
      case "ObjectUnionType": {
        const stubItemType =
          propertyShapeStubType ??
          synthesizeStubAstObjectType({
            identifierNodeKinds: identifierNodeKinds(type.itemType),
            tsFeatures: type.itemType.tsFeatures,
          });
        if (type.kind === "OptionType") {
          stubType = Maybe.of({
            kind: "OptionType",
            itemType: stubItemType,
          });
        } else {
          stubType = Maybe.of({
            kind: "SetType",
            itemType: stubItemType,
            minCount: 0,
            mutable: Maybe.empty(),
          });
        }
        break;
      }
      default:
        return Left(
          new Error(
            `${propertyShape} marked lazy but has ${type.kind} of ${type.itemType.kind}`,
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
    type,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.identifier,
    property,
  );
  return Either.of(property);
}
