import type { ObjectIntersectionType } from "../ObjectIntersectionType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectIntersectionType_toJsonFunctionExpression(
  this: ObjectIntersectionType,
): Code {
  return code`\
(value) => ({
${joinCode(
  this.members.map(
    ({ type }) =>
      code`...${type.toJsonExpression({
        form: "compact",
        variables: { value: code`value` },
      })}`,
  ),
  { on: "," },
)}})`;
}
