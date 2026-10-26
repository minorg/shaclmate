import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_createUnsafeFunction(
  this: ObjectIntersectionType,
): Callable {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return this._function({
    type: code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.createFunctionParameters.signature}) => ${this.expression}`,
    unannotatedExpression: () =>
      code`(${this.createFunctionParameters.variable}) => create(${this.createFunctionParameters.variable}).unsafeCoerce()`,
    unqualifiedName: "createUnsafe",
  });
}
