import { Either, Left } from "purify-ts";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import type * as ast from "../ast/index.js";
import type * as input from "../input/index.js";

export function transformPropertyShapeToAstObjectTypeProperty(
  this: ShapesGraphToAstTransformer,
  propertyShape: input.PropertyShape,
): Either<Error, ast.ObjectType.Property> {
  {
    const property = this.astObjectTypePropertiesByIdentifier.get(
      propertyShape.resource.identifier,
    );
    if (property) {
      return Either.of(property);
    }
  }

  const type = this.transformPropertyShapeToAstType(propertyShape, null);
  if (type.isLeft()) {
    return type;
  }

  const path = propertyShape.path;
  if (path.kind !== "PredicatePath") {
    return Left(
      new Error(`${propertyShape} has non-predicate path, unsupported`),
    );
  }

  const property: ast.ObjectType.Property = {
    comment: propertyShape.comment.map((literal) => literal.value),
    description: propertyShape.description.map((literal) => literal.value),
    label: propertyShape.label.map((literal) => literal.value),
    mutable: propertyShape.mutable,
    name: this.shapeAstName(propertyShape),
    path,
    type: type.extract() as ast.Type,
    visibility: propertyShape.visibility,
  };
  this.astObjectTypePropertiesByIdentifier.set(
    propertyShape.resource.identifier,
    property,
  );
  return Either.of(property);
}
