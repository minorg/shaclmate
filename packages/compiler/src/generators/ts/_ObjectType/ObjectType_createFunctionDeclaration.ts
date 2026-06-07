import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionExpression(this: ObjectType): Code {
  const parametersVariable = code`parameters`;

  const propertyInitializers = this.properties.flatMap((property) =>
    property
      .constructorInitializer({
        variables: { parameters: parametersVariable },
      })
      .toList(),
  );
  invariant(propertyInitializers.length > 0);

  let returnExpression = code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} })`;

  this.discriminantProperty.ifJust((discriminantProperty) => {
    returnExpression = code`${returnExpression}.map(properties => ({ ...properties, ${discriminantProperty.name}: ${literalOf(discriminantProperty.value)} as const }))`;
  });

  const monkeyPatchMethods: string[] = [];
  if (this.configuration.features.has("Object.toJson")) {
    monkeyPatchMethods.push("toJson");
  }
  if (this.configuration.features.has("Object.toString")) {
    monkeyPatchMethods.push(
      `${this.configuration.syntheticNamePrefix}toString`,
    );
  }
  if (monkeyPatchMethods.length > 0) {
    returnExpression = code`${returnExpression}.map(object => ${this.reusables.snippets.monkeyPatchObject}(object, { ${monkeyPatchMethods.join(", ")} }))`;
  }

  return code`((parameters) => ${returnExpression})`;
}
