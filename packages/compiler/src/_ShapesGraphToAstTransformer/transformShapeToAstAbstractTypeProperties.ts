import { Maybe } from "purify-ts";
import * as input from "../input/index.js";

type AstAbstractTypeProperties = {
  readonly comment: Maybe<string>;
  readonly label: Maybe<string>;
};

namespace AstAbstractTypeProperties {
  export const empty: AstAbstractTypeProperties = {
    comment: Maybe.empty(),
    label: Maybe.empty(),
  };
}

export function transformShapeToAstAbstractTypeProperties(
  shape: input.Shape,
): AstAbstractTypeProperties {
  if (shape instanceof input.PropertyShape) {
    // comment, label, et al. belong to the ObjectType.Property, not to the type
    return AstAbstractTypeProperties.empty;
  }

  if (shape.constraints.properties.length > 0) {
    // comment, label, et al. belong to the ObjectType, not to the type
    return AstAbstractTypeProperties.empty;
  }

  if (shape.constraints.xone.length > 0) {
    // comment, label, et al. belong to the ObjectType, not to the type
    return AstAbstractTypeProperties.empty;
  }

  return {
    comment: shape.comment,
    label: shape.label,
  };
}
