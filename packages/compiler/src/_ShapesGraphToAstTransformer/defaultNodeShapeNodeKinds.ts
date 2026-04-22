import type { NodeKind } from "@shaclmate/shacl-ast";

export const defaultNodeShapeNodeKinds: ReadonlySet<NodeKind> = new Set([
  "BlankNode",
  "IRI",
]);
