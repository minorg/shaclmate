import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromJson")) {
    return Maybe.empty();
  }

  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromJsonInitializer({ variables }).toList(),
  );
  invariant(propertyInitializers.length > 0);

  return Maybe.of(code`\
export function fromJson(${variables.jsonObject}: ${this.jsonType().expression}): ${this.reusables.imports.Either}<Error, ${this.expression}> {
  return ${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} }).chain(create);
}`);
}
