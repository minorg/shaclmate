import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_isTypeFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.type")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function is${this.alias.unsafeCoerce()}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${this.alias.unsafeCoerce()} {
  return ${this._discriminantProperty.name} === ${literalOf(this._discriminantProperty.value)};
}`);
}
