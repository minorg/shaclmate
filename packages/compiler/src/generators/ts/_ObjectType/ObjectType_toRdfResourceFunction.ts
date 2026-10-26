import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceFunction(this: ObjectType): Callable {
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
