import type { BlankNode, NamedNode } from "@rdfjs/types";

/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type IdentifierKind = (BlankNode | NamedNode)["termType"];
