import type { Code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for callables.
 */
export abstract class AbstractCallable {
  /**
   * Code to use this callable as a callee or reference it (in composition for example).
   *
   * If the callable has an optional type annotation, it will be included in the returned code.
   */
  abstract readonly annotatedUsage: Code;

  /**
   * Code to use this callable as a callee or reference it (in composition, for example).
   *
   * If the callable has an optional type annotation, it won't be included in the returned code.
   */
  abstract readonly unannotatedUsage: Code;

  toString(): string {
    throw new Error("should never call toString on a Callable");
  }
}
