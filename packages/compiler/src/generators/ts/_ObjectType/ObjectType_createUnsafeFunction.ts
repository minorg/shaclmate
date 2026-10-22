import type { Callable } from "../Callable.js";
import { DeclaredCallable } from "../DeclaredCallable.js";
import { InlineCallable } from "../InlineCallable.js";
import type { ObjectType } from "../ObjectType.js";
import { code } from "../ts-poet-wrapper.js";

export function ObjectType_createUnsafeFunction(this: ObjectType): Callable {
  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  const type = code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.constructorParameters.signature}) => ${this.expression}`;
  const unannotatedExpression = () =>
    code`<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.constructorParameters.signature}): ${this.expression} => create(${this.constructorParameters.variable}).unsafeCoerce()`;

  return this.name
    .map<Callable>(
      (name) =>
        new DeclaredCallable({
          qualifiedName: [name, "createUnsafe"],
          type,
          unannotatedExpression,
        }),
    )
    .orDefault(new InlineCallable(unannotatedExpression, { type }));
}
