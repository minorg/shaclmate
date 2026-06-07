import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toJsonFunctionExpression(this: ObjectType): Code {
  return code`\
((${this.thisVariable}) => JSON.parse(JSON.stringify({ ${joinCode(
    this.properties.flatMap((property) =>
      property
        .toJsonInitializer({
          variables: {
            value: property.accessExpression({
              variables: { object: this.thisVariable },
            }),
          },
        })
        .toList(),
    ),
    { on: "," },
  )} } satisfies ${this.jsonType().expression})))`;
}
