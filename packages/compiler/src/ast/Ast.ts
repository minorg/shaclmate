import type { Type } from "./Type.js";

export interface Ast {
  readonly lazyTypesCount: number;
  readonly namedTypes: readonly Type[];
}
