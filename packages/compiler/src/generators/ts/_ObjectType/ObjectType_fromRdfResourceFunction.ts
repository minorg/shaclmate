import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_fromRdfResourceFunction(this: ObjectType): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FromRdfResourceFunction}<${this.discriminatedExpression}>`,
    unannotatedExpression: () =>
      code`${this.reusables.snippets.wrap_FromRdfResourceFunction}(${this._fromRdfResourceFunction.annotatedUsage})`,
    unqualifiedName: "fromRdfResource",
  });
}
