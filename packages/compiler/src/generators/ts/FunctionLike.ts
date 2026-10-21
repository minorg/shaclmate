import type { AnonymousFunction } from "./AnonymousFunction.js";
import type { DeclaredFunction } from "./DeclaredFunction.js";
import type { FunctionReference } from "./FunctionReference.js";

export type FunctionLike =
  | AnonymousFunction
  | DeclaredFunction
  | FunctionReference;
