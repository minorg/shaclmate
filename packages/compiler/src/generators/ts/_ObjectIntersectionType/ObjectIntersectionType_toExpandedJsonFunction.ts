import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_toExpandedJsonFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(value) => ({
${joinCode(
  this.members.map(
    ({ type }) =>
      code`...${type.toExpandedJsonFunction.unannotatedUsage}(value)`,
  ),
  { on: "," },
)}})`;
}
