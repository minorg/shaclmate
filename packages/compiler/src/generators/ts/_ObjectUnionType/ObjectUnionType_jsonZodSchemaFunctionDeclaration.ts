import { Maybe } from "purify-ts";
import { type Code, code, joinCode } from "ts-poet";
import { imports } from "../imports.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";

export function ObjectUnionType_jsonZodSchemaFunctionDeclaration(
  this: ObjectUnionType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function ${syntheticNamePrefix}jsonZodSchema() {
  return ${imports.z}.discriminatedUnion("${this._discriminantProperty.name}", [${joinCode(
    this.concreteMemberTypes.map((memberType) =>
      memberType.jsonZodSchema({ context: "type" }),
    ),
    { on: ", " },
  )}]);
}`);
}
