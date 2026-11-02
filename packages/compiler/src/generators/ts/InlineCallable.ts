import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractCallable } from "./AbstractCallable.js";
import { CodeThunk } from "./CodeThunk.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * A callable that isn't bound to a variable but always used inline. Annotated and unannotated usage differ in the inclusion of
 * an optional "satisfies" type annotation on the unannotated expression.
 */
export class InlineCallable extends AbstractCallable {
  #unannotatedExpression: CodeThunk;
  #type: Maybe<CodeThunk>;

  constructor(
    unannotatedExpression: CodeThunk,
    options?: { type?: CodeThunk },
  ) {
    super();
    this.#unannotatedExpression = unannotatedExpression;
    this.#type = Maybe.fromNullable(options?.type);
  }

  @Memoize()
  override get annotatedUsage(): Code {
    return this.type
      .map((type) => code`((${this.unannotatedExpression}) satisfies ${type})`)
      .orDefault(this.unannotatedUsage);
  }

  @Memoize()
  private get type(): Maybe<Code> {
    return this.#type.map(CodeThunk.evaluate);
  }

  @Memoize()
  override get unannotatedUsage(): Code {
    return code`(${this.unannotatedExpression})`;
  }

  @Memoize()
  private get unannotatedExpression(): Code {
    return CodeThunk.evaluate(this.#unannotatedExpression);
  }
}
