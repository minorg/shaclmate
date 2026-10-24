import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toJsonFunctionExpression(this: ObjectType): Code {
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

export function ObjectType_toJsonFunctionType(this: ObjectType): Code {
  const variables = {
    object: this.thisVariable,
  };
  return code`${this.reusables.snippets.ToJsonFunction}<${this.propertySubsetExpression((property) => property.toJsonInitializer({ variables }).isJust())}, ${this.toJsonExpression}>`;
}
