import { Memoize } from "typescript-memoize";

import { type Code, code } from "./ts-poet-wrapper.js";

export class DeclaredFunction {
  private readonly qualifiedName: readonly string[];
  private readonly type: { readonly expression: Code };
  readonly #unannotatedExpression: Code | (() => Code);

  constructor({
    unannotatedExpression,
    qualifiedName,
    type,
  }: {
    unannotatedExpression: Code | (() => Code);
    qualifiedName: readonly string[];
    type: { readonly expression: Code };
  }) {
    this.#unannotatedExpression = unannotatedExpression;
    this.qualifiedName = qualifiedName;
    this.type = type;
  }

  @Memoize()
  get usage(): Code {
    return code`${this.qualifiedName.join(".")}`;
  }

  @Memoize()
  get declaration(): Code {
    return code`const ${this.unqualifiedName}: ${this.type.expression} = ${this.unannotatedExpression};`;
  }

  get unqualifiedName(): string {
    return this.qualifiedName.at(-1)!;
  }

  @Memoize()
  get unannotatedExpression(): Code {
    if (typeof this.#unannotatedExpression === "function") {
      return this.#unannotatedExpression();
    }
    return this.#unannotatedExpression;
  }
}
