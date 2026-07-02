import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_typeGuardFunctionExpression(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.type")) {
    return Maybe.empty();
  }

  if (this.synthetic) {
    return Maybe.empty();
  }

  const discriminantProperty = this.discriminantProperty.extract();
  if (!discriminantProperty) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
(object: ${this.configuration.syntheticNamePrefix}Object): object is ${this.expression} => object.${discriminantProperty.name} === ${literalOf(discriminantProperty.value)}`);
}
