import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toStringRecordFunctionExpression(
  this: ObjectType,
): Code {
  return code`(${this.thisVariable}) => ${this.reusables.snippets.compactRecord}({${joinCode(
    this.properties.flatMap((property) =>
      property
        .toStringInitializer({
          variables: {
            object: this.thisVariable,
          },
        })
        .toList(),
    ),
    { on: "," },
  )}})`;
}
