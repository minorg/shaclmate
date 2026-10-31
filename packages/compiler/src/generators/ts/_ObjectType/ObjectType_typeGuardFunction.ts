import { Maybe } from "purify-ts";

import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_typeGuardFunction(
  this: ObjectType,
): Maybe<Callable> {
  const discriminantProperty = this.discriminantProperty.extract();
  if (!discriminantProperty) {
    return Maybe.empty();
  }

  const name = this.name.extract();
  if (!name) {
    return Maybe.empty();
  }

  return Maybe.of(
    this._function({
      type: code`(object: ${this.configuration.syntheticNamePrefix}Object) => object is ${this.discriminatedExpression}`,
      unannotatedExpression: code`(object): object is ${this.discriminatedExpression} => object.${discriminantProperty.name} === ${literalOf(discriminantProperty.value)})`,
      unqualifiedName: `is${name}`,
    }),
  );
}
