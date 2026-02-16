import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_isTypeFunctionDeclaration(this: ObjectType): Code {
  return code`\
export function is${this.name}(object: ${syntheticNamePrefix}Object): object is ${this.name} {
  switch (object.${this._discriminantProperty.name}) {
    ${this._discriminantProperty.descendantValues
      .concat(this._discriminantProperty.ownValues)
      .map((value) => `case "${value}":`)
      .join("\n")} return true; default: return false;
  }
}`;
}
