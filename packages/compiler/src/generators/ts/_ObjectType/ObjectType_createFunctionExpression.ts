import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionExpression(this: ObjectType): Code {
  const parametersVariable = code`parameters${this.constructorParameters.hasQuestionToken ? "?" : ""}`;

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

  const monkeyPatchMethods: Record<string, Code> = {};
  if (this.configuration.features.has("Object.toJson")) {
    monkeyPatchMethods["toJson"] = this.toJsonFunction;
  }
  if (this.configuration.features.has("Object.toString")) {
    monkeyPatchMethods[`${this.configuration.syntheticNamePrefix}toString`] =
      this.toStringFunction;
  }
  if (Object.keys(monkeyPatchMethods).length > 0) {
    returnExpression = code`${returnExpression}.map(object => ${this.reusables.snippets.monkeyPatchObject}(object, ${monkeyPatchMethods}))`;
  }

  return code`((parameters${this.name.map(() => code``).orDefaultLazy(() => code`: ${this.expression}`)}) => ${returnExpression})`;
}
