import type { NodeKind } from "@shaclmate/shacl-ast";
import { Either } from "purify-ts";
import * as input from "../input/index.js";

// if (this.identifierIn.length > 0) {
//   if (thisNodeKinds.has("BlankNode")) {
//     return Left(
//       new Error(`${this} specifies sh:in but also allows blank nodes`),
//     );
//   }
//   thisNodeKinds.add("NamedNode");
// }

// const parentNodeKinds = this.parentNodeShapes.chain((parentNodeShapes) =>
//   Either.sequence(
//     parentNodeShapes.map((parentNodeShape) =>
//       parentNodeShape.nodeKinds.map((_) => [..._]),
//     ),
//   ).map((_) => new Set(_.flat())),
// );

// return parentNodeKinds.chain((parentNodeKinds) => {
//   if (thisNodeKinds.size === 0) {
//     if (parentNodeKinds.size > 0) {
//       return Either.of(parentNodeKinds);
//     }

//     // The default
//     return Either.of(new Set(["BlankNode", "NamedNode"]));
//   }

//   // Check that thisNodeKinds doesn't conflict with parent node kinds
//   for (const thisNodeKind of thisNodeKinds) {
//     if (!parentNodeKinds.has(thisNodeKind)) {
//       throw new Error(
//         `${this} has a nodeKind ${thisNodeKind} that is not in its parent's node kinds`,
//       );
//     }
//   }

//   return Either.of(thisNodeKinds);
// });

export function shapeNodeKinds(
  shape: input.Shape,
): Either<Error, ReadonlySet<NodeKind>> {
  return Either.encase(() => {
    const nodeKinds = new Set<NodeKind>([
      ...shape.constraints.nodeKinds.orDefault(new Set()),
    ]);
    if (nodeKinds.size > 0) {
      return nodeKinds;
    }

    if (shape instanceof input.PropertyShape) {
      shape.defaultValue.ifJust((defaultValue) =>
        nodeKinds.add(defaultValue.termType),
      );
      if (nodeKinds.size > 0) {
        return nodeKinds;
      }
    }

    for (const hasValue of shape.constraints.hasValues) {
      nodeKinds.add(hasValue.termType);
    }
    if (nodeKinds.size > 0) {
      return nodeKinds;
    }

    for (const term of shape.constraints.in_) {
      nodeKinds.add(term.termType);
    }

    return nodeKinds;
  });
}
