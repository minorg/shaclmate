import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_jsonParseFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function parse(json: unknown): ${imports.Either}<Error, ${syntheticNamePrefix}Json> {
  const jsonSafeParseResult = schema().safeParse(json);
  if (!jsonSafeParseResult.success) { return ${imports.Left}(jsonSafeParseResult.error); }
  return ${imports.Right}(jsonSafeParseResult.data);
}`);
}
