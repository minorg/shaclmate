import { Curie } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { shapeIdentifier } from "./shapeIdentifier.js";

export function shapeAstTypeName(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
): Maybe<string> {
  if (shape.kind !== "NodeShape") {
    return Maybe.empty();
  }

  if (shape.identifier.termType !== "NamedNode") {
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
  const shapeIdentifier_ = shapeIdentifier.call(this, shape);
  if (shapeIdentifier_ instanceof Curie) {
    if (shapeIdentifier_.hasUniqueReference) {
      return Maybe.of(shapeIdentifier_.reference);
    }

    return Maybe.of(`${shapeIdentifier_.prefix}_${shapeIdentifier_.reference}`);
  }

  return Maybe.empty();
}
