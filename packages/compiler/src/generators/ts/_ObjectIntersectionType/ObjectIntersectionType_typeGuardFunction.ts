import { Maybe } from "purify-ts";

import type { Callable } from "../Callable.js";
import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_typeGuardFunction(
  this: ObjectIntersectionType,
): Maybe<Callable> {
  const discriminatedType = this.discriminatedType.extract();
  if (!discriminatedType) {
    return Maybe.empty();
  }

  const name = this.name.extract();
  if (!name) {
    return Maybe.empty();
  }

  return Maybe.of(
    this._function({
      type: code`${this.reusables.snippets.ObjectTypeGuardFunction}<${discriminatedType.expression}>`,
      unannotatedExpression: code`(object): object is ${discriminatedType.expression} => object.${discriminatedType.discriminantProperty.name} === ${literalOf(discriminatedType.discriminantProperty.values[0])}`,
      unqualifiedName: `is${name}`,
    }),
  );
}
