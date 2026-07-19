import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionExpression(this: ObjectType): Code {
  const parametersVariable = code`${this.constructorParameters.variable}${this.constructorParameters.hasQuestionToken ? "?" : ""}`;

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

  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return code`(<${syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${parametersVariable}: ${this.constructorParameters.type.expression})${this.name.map((name) => code`: ${this.reusables.imports.Either}<Error, ${name}>`).orDefault(code``)} => ${returnExpression})`;
}
