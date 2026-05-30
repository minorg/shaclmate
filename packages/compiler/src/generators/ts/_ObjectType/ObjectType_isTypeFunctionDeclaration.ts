import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_isTypeFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.type")) {
    return Maybe.empty();
  }

  if (this.synthetic) {
    return Maybe.empty();
  }

  const alias = this.alias.extract();
  const discriminantProperty = this.discriminantProperty.extract();
  if (!alias || !discriminantProperty) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function is${alias}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${alias} {
  return object.${discriminantProperty.name} === ${literalOf(discriminantProperty.value)};
}`);
}
