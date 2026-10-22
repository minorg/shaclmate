import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfResourceFunction(this: ObjectType): Callable {
  const type = code`${this.reusables.snippets.FromRdfResourceFunction}<${this.expression}>`;
  const unannotatedExpression = () =>
    code`${this.reusables.snippets.wrap_FromRdfResourceFunction}(${this._fromRdfResourceFunction.annotatedUsage})`;

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "fromRdfResource"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
