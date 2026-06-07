import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_jsonTypeExpression(this: ObjectType): Code {
  return code`{ ${joinCode(
    this.properties.flatMap((property) => property.jsonSignature.toList()),
    { on: ";" },
  )} }`;
}
