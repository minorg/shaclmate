import type { IdentifierKind } from "@shaclmate/shacl-ast";
import N3 from "n3";
import { Either, Left, Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type { TsFeature } from "../enums/index.js";
import type * as input from "../input/index.js";
import { pickLiteral } from "./pickLiteral.js";

function synthesizeStubAstObjectType({
  identifierKinds,
  tsFeatures,
}: {
  identifierKinds: Set<IdentifierKind>;
  tsFeatures: Set<TsFeature>;
}): ast.ObjectType {
  let syntheticName: string;
  switch (identifierKinds.size) {
    case 1:
      invariant(identifierKinds.has("NamedNode"));
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
    identifierKinds,
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
    toRdfTypes: [],
    tsFeatures,
    tsImports: [],
    tsObjectDeclarationType: "class",
  };
}

export function transformPropertyShapeToAstObjectTypeProperty(
  this: ShapesGraphToAstTransformer,
  {
    objectType,
    propertyShape,
  }: {
    objectType: {
      identifierKinds: Set<IdentifierKind>;
      tsFeatures: Set<TsFeature>;
    };
    propertyShape: input.PropertyShape;
  },
): Either<Error, ast.ObjectType.Property> {
  {
    const property = this.astObjectTypePropertiesByIdentifier.get(
      propertyShape.identifier,
    );
    if (property) {
      return Either.of(property);
    }
  }

  const typeEither = this.transformPropertyShapeToAstType(propertyShape, null);
  if (typeEither.isLeft()) {
    return typeEither;
  }
  const type = typeEither.unsafeCoerce();

  if (propertyShape.lazy.orDefault(false)) {
    switch (type.kind) {
      case "ObjectIntersectionType":
      case "ObjectType":
      case "ObjectUnionType":
        break;
      case "OptionType":
      case "SetType": {
        switch (type.itemType.kind) {
          case "ObjectIntersectionType":
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
    stubType: propertyShape.lazy.map(() =>
      synthesizeStubAstObjectType(objectType),
    ),
    type,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.identifier,
    property,
  );
  return Either.of(property);
}
