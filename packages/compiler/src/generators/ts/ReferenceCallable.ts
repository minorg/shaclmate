import type { ConditionalOutput } from "ts-poet/build/ConditionalOutput.js";
import { AbstractCallable } from "./AbstractCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * A callable that's a reference to a snippet, an import, or a global function.
 *
 * Callers assume the referent carries its own type annotations, so there's no distinction between annotated and unannotated usage.
 */
export class ReferenceCallable extends AbstractCallable {
  override readonly annotatedUsage: Code;
  override readonly unannotatedUsage: Code;

  constructor(reference: ConditionalOutput | Code) {
    super();
    this.annotatedUsage = this.unannotatedUsage = code`${reference}`;
  }
}
