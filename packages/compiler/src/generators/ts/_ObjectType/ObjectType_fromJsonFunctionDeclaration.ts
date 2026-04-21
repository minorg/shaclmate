import { Maybe } from "purify-ts";
import { imports } from "../imports.js";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  if (this.abstract) {
    return Maybe.empty();
  }

  let propertiesFromJsonExpression = code`${syntheticNamePrefix}propertiesFromJson(json)`;
  if (this.declarationType === "class") {
    propertiesFromJsonExpression = code`${propertiesFromJsonExpression}.map(properties => new ${this.name}(properties))`;
  }
  return Maybe.of(code`\
export function ${syntheticNamePrefix}fromJson(json: unknown): ${imports.Either}<Error, ${this.name}> {
  return ${propertiesFromJsonExpression};
}`);
}
