import type { ObjectType } from "../ObjectType.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_jsonParseFunctionDeclaration(
  this: ObjectType,
): Code {
  return code`\
export function parse(json: unknown): ${this.reusables.imports.Either}<Error, Json> {
  const jsonSafeParseResult = schema().safeParse(json);
  if (!jsonSafeParseResult.success) { return ${this.reusables.imports.Left}(jsonSafeParseResult.error); }
  return ${this.reusables.imports.Right}(jsonSafeParseResult.data);
}`;
}
