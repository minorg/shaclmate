import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionType(this: ObjectType): Code {
  return code`${this.reusables.snippets.ToStringFunction}<${this.propertySubsetExpression(
    (property) =>
      property
        .toStringInitializer({ variables: { object: code`object` } })
        .isJust(),
  )}>`;
}
