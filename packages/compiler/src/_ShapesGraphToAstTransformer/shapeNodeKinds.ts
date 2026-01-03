import type { NodeKind } from "@shaclmate/shacl-ast";
import * as input from "../input/index.js";

export function shapeNodeKinds(shape: input.Shape): ReadonlySet<NodeKind> {
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
}
