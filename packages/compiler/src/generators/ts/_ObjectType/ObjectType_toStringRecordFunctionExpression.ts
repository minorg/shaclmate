import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toStringRecordFunctionExpression(
  this: ObjectType,
): Code {
  return code`((${this.thisVariable}) => ${this.toStringRecordExpression({ variables: { value: this.thisVariable } })})`;
}
