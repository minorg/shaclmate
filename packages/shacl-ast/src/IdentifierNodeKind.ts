import type { BlankNode, NamedNode } from "@rdfjs/types";

/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type IdentifierNodeKind = (BlankNode | NamedNode)["termType"];
