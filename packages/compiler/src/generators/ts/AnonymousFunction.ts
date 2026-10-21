import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { type Code, code } from "./ts-poet-wrapper.js";

export class AnonymousFunction {
  #unannotatedExpression: Code | (() => Code);

  readonly type: Maybe<{ readonly expression: Code }>;

  constructor(
    unannotatedExpression: Code | (() => Code),
    options?: { type?: { readonly expression: Code } },
  ) {
    this.#unannotatedExpression = unannotatedExpression;
    this.type = Maybe.fromNullable(options?.type);
  }

  @Memoize()
  get annotatedUsage(): Code {
    return this.type
      .map(
        (type) =>
          code`((${this.unannotatedExpression}) satisfies ${type.expression})`,
      )
      .orDefault(this.unannotatedUsage);
  }

  @Memoize()
  get unannotatedUsage(): Code {
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
