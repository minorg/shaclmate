import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toLoggableFunctionExpression(
  this: ObjectType,
): Code {
  return code`(${this.thisVariable}: ${this.expression}): Record<string, string> => ${this.reusables.snippets.compactRecord}({${joinCode(
    this.properties.flatMap((property) =>
      property
        .toLoggableInitializer({
          variables: {
            object: this.thisVariable,
          },
        })
        .toList(),
    ),
    { on: "," },
  )}})`;
}
