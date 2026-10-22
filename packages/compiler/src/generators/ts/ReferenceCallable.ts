import type { ConditionalOutput } from "ts-poet/build/ConditionalOutput.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * A callable that's a reference to a snippet, an import, or a global function.
 *
 * Callers assume the referent carries its own type annotations, so there's no distinction between annotated and unannotated usage.
 */
export class ReferenceCallable {
  readonly annotatedUsage: Code;
  readonly unannotatedUsage: Code;

  constructor(reference: ConditionalOutput | Code) {
    this.annotatedUsage = this.unannotatedUsage = code`${reference}`;
  }
}
