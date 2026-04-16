import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_jsonSchemaFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}jsonSchema() {
  return ${imports.z}.toJSONSchema(${syntheticNamePrefix}jsonZodSchema());
}`);
}
