import { Curie } from "@rdfx/curie";
import { Maybe } from "purify-ts";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import { isNodeShape } from "./isNodeShape.js";

export function shapeAstTypeName(
  this: ShapesGraphToAstTransformer,
  shape: input.UndiscriminatedShape,
): Maybe<string> {
  if (!isNodeShape(shape)) {
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
    if (
      (this.shapesGraph.curieReferenceCounts[shapeIdentifier.reference] ??
        0) === 1
    ) {
      return Maybe.of(shapeIdentifier.reference);
    }

    return Maybe.of(`${shapeIdentifier.prefix}_${shapeIdentifier.reference}`);
  }

  return Maybe.empty();
}
