import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_jsonSchemaFunctionDeclaration(
  this: ObjectType,
): Code {
  return code`\
export function ${syntheticNamePrefix}jsonSchema() {
  return ${imports.z}.toJSONSchema(${syntheticNamePrefix}jsonZodSchema());
}`;
}
