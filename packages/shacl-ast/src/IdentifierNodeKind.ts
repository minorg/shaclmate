import type { NodeKind } from "./NodeKind.js";

/**
 * TypeScript enum corresponding to sh:NodeKind, for simpler manipulation.
 */
export type IdentifierNodeKind = Exclude<NodeKind, "Literal">;
