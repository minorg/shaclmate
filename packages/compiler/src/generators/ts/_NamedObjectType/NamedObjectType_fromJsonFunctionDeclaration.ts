import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromJsonFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  let returnExpression = code`${syntheticNamePrefix}propertiesFromJson(json)`;
  if (this.declarationType === "class") {
    returnExpression = code`new ${this.name}(${returnExpression})`;
  }
  return Maybe.of(code`\
export function ${syntheticNamePrefix}fromJson(json: ${this.jsonType().name}): ${this.name} {
  return ${returnExpression};
}`);
}
