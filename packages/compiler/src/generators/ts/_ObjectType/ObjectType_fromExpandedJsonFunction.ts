import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromExpandedJsonFunctionExpression(
  this: ObjectType,
): Code {
  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromExpandedJsonInitializer({ variables }).toList(),
  );
  invariant(propertyInitializers.length > 0);

  return code`\
(${variables.jsonObject}) => ${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} }).chain(${this.createFunction.annotatedUsage})`;
}

export function ObjectType_fromExpandedJsonFunctionType(
  this: ObjectType,
): Code {
  return code`${this.reusables.snippets.FromExpandedJsonFunction}<${this.discriminatedExpression}, ${this.expandedJsonType.expression}>`;
}
