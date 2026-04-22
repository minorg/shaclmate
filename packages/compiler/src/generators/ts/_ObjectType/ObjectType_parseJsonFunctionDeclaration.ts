import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_parseJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}parseJson(json: unknown): ${imports.Either}<Error, ${this.name}> {
  const ${syntheticNamePrefix}jsonSafeParseResult = ${syntheticNamePrefix}jsonZodSchema().safeParse(json);
  if (!${syntheticNamePrefix}jsonSafeParseResult.success) { return ${imports.Left}(${syntheticNamePrefix}jsonSafeParseResult.error); }
  return ${imports.Right}(${syntheticNamePrefix}fromJson(${syntheticNamePrefix}jsonSafeParseResult.data));
}`);
}
