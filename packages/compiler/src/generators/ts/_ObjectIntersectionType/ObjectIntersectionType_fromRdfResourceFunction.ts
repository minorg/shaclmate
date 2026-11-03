import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_fromRdfResourceFunction(
  this: ObjectIntersectionType,
): Callable {
  return this._function({
    type: code`${this.reusables.snippets.FromRdfResourceFunction}<${this.discriminatedType.map((discriminatedType) => discriminatedType.expression).orDefault(this.expression)}>`,
    unannotatedExpression: () =>
      code`${this.reusables.snippets.wrap_FromRdfResourceFunction}(${this._fromRdfResourceFunction.annotatedUsage})`,
    unqualifiedName: "fromRdfResource",
  });
}
