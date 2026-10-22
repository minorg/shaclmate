import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_toStringFunctionExpression(this: ObjectType): Code {
  const expression = code`JSON.stringify(${this.toStringRecordFunction.unannotatedUsage}(${this.thisVariable}))`;
  return code`(${this.thisVariable}) => ${this.name.map((name) => code`\`${name}(\${${expression}})\``).orDefault(expression)}`;
}
