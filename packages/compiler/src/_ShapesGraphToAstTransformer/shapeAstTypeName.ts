import { Curie } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type * as input from "../input/index.js";

export function shapeAstTypeName(shape: input.Shape): Maybe<string> {
  if (shape.$type !== "NodeShape") {
    return Maybe.empty();
  }

  if (shape.$identifier.termType !== "NamedNode") {
    return Maybe.empty();
  }

  // Explicit shaclmate:name
  if (shape.shaclmateName.isJust()) {
    return shape.shaclmateName;
  }

  // Explicit rdfs:label
  if (shape.label.isJust()) {
    return shape.label;
  }

  // CURIE shape identifier
  if (shape.$identifier instanceof Curie) {
    if (shape.$identifier.hasUniqueReference) {
      return Maybe.of(shape.$identifier.reference);
    }

    return Maybe.of(
      `${shape.$identifier.prefix}_${shape.$identifier.reference}`,
    );
  }

  return Maybe.empty();
}
