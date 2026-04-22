import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_isTypeFunctionDeclaration(
  this: NamedObjectType,
): Code {
  return code`\
export function is${this.name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
  switch (object.${this._discriminantProperty.name}) {
    ${this._discriminantProperty.type.descendantValues
      .concat(this._discriminantProperty.type.ownValues)
      .map((value) => `case "${value}":`)
      .join("\n")} return true; default: return false;
  }
}`;
}
