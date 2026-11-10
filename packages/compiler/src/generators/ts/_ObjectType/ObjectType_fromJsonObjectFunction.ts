import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonObjectFunctionExpression(
  this: ObjectType,
): Code {
  const optionsVariable = code`options`;

  const variables = {
    context: code`${optionsVariable}.context`,
    jsonObject: code`jsonObject`,
    objectSet: code`${optionsVariable}.objectSet`,
    options: optionsVariable,
  };

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromJsonObjectInitializer({ variables }).toList(),
  );
  invariant(propertyInitializers.length > 0);

  return code`\
(${variables.jsonObject}, ${variables.options}${this.name.map(() => " = {}").orDefault("")}) => ${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} }).chain(${this.createFunction.annotatedUsage})`;
}

export function ObjectType_fromJsonObjectFunctionType(this: ObjectType): Code {
  return code`${this.reusables.snippets.FromJsonFunction}<${this.jsonObjectType.expression}, ${this.discriminatedType.map((discriminatedType) => discriminatedType.expression).orDefault(this.expression)}, undefined>`;
}
