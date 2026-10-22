import { Memoize } from "typescript-memoize";

import { AbstractCallable } from "./AbstractCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * A callable that is bound to an annotated variable. Consumers reference the variable, so there's no distinction
 * between annotated and unannotated usage.
 */
export class DeclaredCallable extends AbstractCallable {
  private readonly qualifiedName: readonly string[];
  private readonly type: Code;
  readonly #unannotatedExpression: Code | (() => Code);

  constructor({
    unannotatedExpression,
    qualifiedName,
    type,
  }: {
    unannotatedExpression: Code | (() => Code);
    qualifiedName: readonly string[];
    type: Code;
  }) {
    super();
    this.#unannotatedExpression = unannotatedExpression;
    this.qualifiedName = qualifiedName;
    this.type = type;
  }

  @Memoize()
  override get annotatedUsage(): Code {
    return code`${this.qualifiedName.join(".")}`;
  }

  @Memoize()
  get declaration(): Code {
    return code`const ${this.unqualifiedName}: ${this.type} = ${this.unannotatedExpression};`;
  }

  @Memoize()
  get unannotatedExpression(): Code {
    if (typeof this.#unannotatedExpression === "function") {
      return this.#unannotatedExpression();
    }
    return this.#unannotatedExpression;
  }

  @Memoize()
  override get unannotatedUsage(): Code {
    return code`${this.qualifiedName.join(".")}`;
  }

  get unqualifiedName(): string {
    return this.qualifiedName.at(-1)!;
  }
}
