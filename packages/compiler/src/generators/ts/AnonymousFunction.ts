import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { type Code, code } from "./ts-poet-wrapper.js";

export class AnonymousFunction {
  readonly type: Maybe<{ readonly expression: Code }>;
  #unannotatedExpression: Code | (() => Code);

  constructor(
    unannotatedExpression: Code | (() => Code),
    options?: { type?: { readonly expression: Code } },
  ) {
    this.#unannotatedExpression = unannotatedExpression;
    this.type = Maybe.fromNullable(options?.type);
  }

  @Memoize()
  get usage(): Code {
    return this.type
      .map(
        (type) =>
          code`((${this.unannotatedExpression}) satisfies ${type.expression})`,
      )
      .orDefault(code`(${this.unannotatedExpression})`);
  }

  @Memoize()
  get unannotatedExpression(): Code {
    if (typeof this.#unannotatedExpression === "function") {
      return this.#unannotatedExpression();
    }
    return this.#unannotatedExpression;
  }
}
