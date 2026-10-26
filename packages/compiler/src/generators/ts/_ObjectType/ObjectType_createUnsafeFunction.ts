import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_createUnsafeFunction(this: ObjectType): Callable {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return this._function({
    type: code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.createFunctionParameters.signature}) => ${this.discriminatedExpression}`,
    unannotatedExpression: () =>
      code`(${this.createFunctionParameters.variable}) => create(${this.createFunctionParameters.variable}).unsafeCoerce()`,
    unqualifiedName: "createUnsafe",
  });
}
