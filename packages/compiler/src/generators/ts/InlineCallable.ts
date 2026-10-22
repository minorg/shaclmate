import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCallable } from "./AbstractCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * A callable that isn't bound to a variable but always used inline. Annotated and unannotated usage differ in the inclusion of
 * an optional "satisfies" type annotation on the unannotated expression.
 */
export class InlineCallable extends AbstractCallable {
  #unannotatedExpression: Code | (() => Code);

  readonly type: Maybe<Code>;

  constructor(
    unannotatedExpression: Code | (() => Code),
    options?: { type?: Code },
  ) {
    super();
    this.#unannotatedExpression = unannotatedExpression;
    this.type = Maybe.fromNullable(options?.type);
  }

  @Memoize()
  override get annotatedUsage(): Code {
    return this.type
      .map((type) => code`((${this.unannotatedExpression}) satisfies ${type})`)
      .orDefault(this.unannotatedUsage);
  }

  @Memoize()
  override get unannotatedUsage(): Code {
    return code`(${this.unannotatedExpression})`;
  }

  @Memoize()
  private get unannotatedExpression(): Code {
    if (typeof this.#unannotatedExpression === "function") {
      return this.#unannotatedExpression();
    }
    return this.#unannotatedExpression;
  }
}
