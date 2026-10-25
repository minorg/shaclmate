import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_toRdfResourceFunction(this: ObjectType): Callable {
  const identifierTypeExpression = this.name
    .map(() => this.identifierTypeAlias)
    .orDefault(this.identifierType.expression);
  const thisTypeExpression = this.propertySubsetExpression(
    (property) => property.kind !== "Discriminant",
  );
  return this._function({
    type: code`${this.reusables.snippets.ToRdfResourceFunction}<${identifierTypeExpression}, ${thisTypeExpression}>`,
    unannotatedExpression: () =>
      code`${this.reusables.snippets.wrap_ToRdfResourceFunction}<${identifierTypeExpression}, ${thisTypeExpression}>(${this._toRdfResourceFunction.annotatedUsage})`,
    unqualifiedName: "toRdfResource",
  });
}
