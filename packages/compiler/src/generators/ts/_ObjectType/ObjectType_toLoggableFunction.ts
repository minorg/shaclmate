import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toLoggableFunctionExpression(
  this: ObjectType,
): Code {
  const variables = {
    object: this.thisVariable,
  };

  return code`(${this.thisVariable}) => ${this.reusables.snippets.compactRecord}({${joinCode(
    this.properties.flatMap((property) =>
      property.toLoggableInitializer({ variables }).toList(),
    ),
    { on: "," },
  )}})`;
}

export function ObjectType_toLoggableFunctionType(this: ObjectType): Code {
  const variables = {
    object: this.thisVariable,
  };

  return code`${this.reusables.snippets.ToLoggableFunction}<${this.propertySubsetExpression((property) => property.toLoggableInitializer({ variables }).isJust())}>`;
}
