import { Either, Left } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";
import { pickLiteral } from "./pickLiteral.js";

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
    lazy: propertyShape.lazy,
    mutable: propertyShape.mutable,
    name: this.shapeAstName(propertyShape),
    order: propertyShape.order.orDefault(0),
    path,
    type,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.identifier,
    property,
  );
  return Either.of(property);
}
