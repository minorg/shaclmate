import { Curie } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type * as input from "../input/index.js";

export function shapeAstTypeName(shape: input.Shape): Maybe<string> {
  if (shape.$type !== "NodeShape") {
    return Maybe.empty();
  }

  const shapeIdentifier = shape.$identifier();
  if (shapeIdentifier.termType !== "NamedNode") {
    return Maybe.empty();
  }

  // Explicit shaclmate:name
  if (shape.shaclmateName.isJust()) {
    return shape.shaclmateName;
  }

  // CURIE shape identifier
  if (shapeIdentifier instanceof Curie) {
    if (shapeIdentifier.hasUniqueReference) {
      return Maybe.of(shapeIdentifier.reference);
    }

    return Maybe.of(`${shapeIdentifier.prefix}_${shapeIdentifier.reference}`);
  }

  return Maybe.empty();
}
