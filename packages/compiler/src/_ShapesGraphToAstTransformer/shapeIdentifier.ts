import type { BlankNode, NamedNode } from "@rdfjs/types";
import type * as input from "../input/index.js";
import type { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";

export function shapeIdentifier(
  this: ShapesGraphToAstTransformer,
  shape: input.Shape,
): BlankNode | NamedNode {
  switch (shape.identifier.termType) {
    case "BlankNode":
      return shape.identifier;
    case "NamedNode":
      return (
        this.curieFactory.create(shape.identifier).extract() ?? shape.identifier
      );
  }
}
