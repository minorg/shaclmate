import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionExpression(this: ObjectType): Code {
  return code`(${this.thisVariable}) => JSON.stringify(${this.toStringRecordFunction.annotatedUsage})`;
}
