import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_isTypeFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.type")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function is${this.name}(object: ${this.configuration.syntheticNamePrefix}Object): object is ${this.name} {
  switch (object.${this._discriminantProperty.name}) {
    ${this._discriminantProperty.type.descendantValues
      .concat(this._discriminantProperty.type.ownValues)
      .map((value) => `case "${value}":`)
      .join("\n")} return true; default: return false;
  }
}`);
}
