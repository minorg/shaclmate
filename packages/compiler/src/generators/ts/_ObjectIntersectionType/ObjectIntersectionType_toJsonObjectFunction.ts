import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_toJsonObjectFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(value) => ({
${joinCode(
  this.members.map(
    ({ type }) => code`...${type.toJsonObjectFunction.unannotatedUsage}(value)`,
  ),
  { on: "," },
)}})`;
}
