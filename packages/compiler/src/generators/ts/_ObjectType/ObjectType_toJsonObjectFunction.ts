import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toJsonObjectFunctionExpression(
  this: ObjectType,
): Code {
  const variables = {
    object: this.thisVariable,
  };
  return code`\
(${this.thisVariable}) => JSON.parse(JSON.stringify({ ${joinCode(
    this.properties.flatMap((property) =>
      property
        .toJsonInitializer({
          variables,
        })
        .toList(),
    ),
    { on: "," },
  )} }))`;
}

export function ObjectType_toJsonObjectFunctionType(this: ObjectType): Code {
  return code`${this.reusables.snippets.ToJsonObjectFunction}<${this.expression}, ${this.jsonObjectType.expression}>`;
}
