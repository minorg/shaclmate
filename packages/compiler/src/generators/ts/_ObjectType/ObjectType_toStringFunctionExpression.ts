import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionExpression(this: ObjectType): Code {
  return this.name
    .map(
      (name) =>
        code`((${this.thisVariable}) => \`${name}(\${JSON.stringify(toStringRecord(${this.thisVariable}))})\`)`,
    )
    .orDefault(
      code`((${this.thisVariable}) => JSON.stringify(${this.toStringRecordExpression({ variables: { value: this.thisVariable } })}))`,
    );
}
