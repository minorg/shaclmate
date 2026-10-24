import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonFunctionExpression(this: ObjectType): Code {
  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromJsonInitializer({ variables }).toList(),
  );
  invariant(propertyInitializers.length > 0);

  return code`\
(${variables.jsonObject}) => ${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} }).chain(${this.createFunction.annotatedUsage})`;
}

export function ObjectType_fromJsonFunctionType(this: ObjectType): Code {
  return code`${this.reusables.snippets.FromJsonFunction}<${this.expression}, Omit<${this.jsonType({ form: "expanded" }).expression}, ${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}>>`;
}
