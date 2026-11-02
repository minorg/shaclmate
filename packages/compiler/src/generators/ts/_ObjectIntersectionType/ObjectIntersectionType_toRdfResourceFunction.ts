import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_toRdfResourceFunction(
  this: ObjectIntersectionType,
): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);

  return this._function({
    type: code`${this.reusables.snippets.ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>`,
    unannotatedExpression: () =>
      code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${identifierTypeExpression}, ${this.expression}>(${this._toRdfResourceFunction.annotatedUsage})`,
    unqualifiedName: "toRdfResource",
  });
}
