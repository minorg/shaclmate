import { Memoize } from "typescript-memoize";

import { type Code, code } from "./ts-poet-wrapper.js";

export class DeclaredFunction {
  private readonly unannotatedExpression: Code;
  private readonly qualifiedName: readonly string[];
  private readonly type: { readonly expression: Code };

  constructor({
    unannotatedExpression,
    qualifiedName,
    type,
  }: {
    unannotatedExpression: Code;
    qualifiedName: readonly string[];
    type: { readonly expression: Code };
  }) {
    this.unannotatedExpression = unannotatedExpression;
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
}
