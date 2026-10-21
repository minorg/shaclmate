import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { type Code, code } from "./ts-poet-wrapper.js";

export class AnonymousFunction {
  readonly type: Maybe<{ readonly expression: Code }>;

  constructor(
    readonly unannotatedExpression: Code,
    options?: { type?: { readonly expression: Code } },
  ) {
    this.type = Maybe.fromNullable(options?.type);
  }

  @Memoize()
  get usage(): Code {
    return this.type
      .map(
        (type) =>
          code`((${this.unannotatedExpression}) satisfies ${type.expression})`,
      )
      .orDefault(this.unannotatedExpression);
  }
}
