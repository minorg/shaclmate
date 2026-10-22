import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceFunction(this: ObjectType): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);
  const type = code`${this.reusables.snippets.ToRdfResourceFunction}<${this.expression}, ${identifierTypeExpression}>`;
  const unannotatedExpression = () =>
    code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>(${this._toRdfResourceFunction.annotatedUsage})`;

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "toRdfResource"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
