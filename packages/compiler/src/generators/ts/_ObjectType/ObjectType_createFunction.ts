import { invariant } from "ts-invariant";
import type { Callable } from "../Callable.js";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

function ObjectType_createFunctionExpression(this: ObjectType): Code {
  const parametersVariable = code`${this.createFunctionParameters.variable}${this.createFunctionParameters.hasQuestionToken ? "?" : ""}`;

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
    monkeyPatchMethods["toJson"] = this.toJsonFunction.annotatedUsage;
  }
  if (this.configuration.features.has("Object.toString")) {
    monkeyPatchMethods[`${this.configuration.syntheticNamePrefix}toString`] =
      this.toStringFunction.annotatedUsage;
  }
  if (Object.keys(monkeyPatchMethods).length > 0) {
    returnExpression = code`${returnExpression}.map(object => ${this.reusables.snippets.monkeyPatchObject}(object, ${monkeyPatchMethods}))`;
  }

  return code`(<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${parametersVariable}: ${this.createFunctionParameters.type.expression})${this.name.map((name) => code`: ${this.reusables.imports.Either}<Error, ${name}>`).orDefault(code``)} => ${returnExpression})`;
}

export function ObjectType_createFunction(this: ObjectType): Callable {
  return this._function({
    type: code`<${this.configuration.syntheticNamePrefix}DefaultNamespaceT extends ${this.reusables.snippets.NamespaceBuilder} = ${this.reusables.snippets.NamespaceBuilder}>(${this.createFunctionParameters.signature}) => ${this.reusables.imports.Either}<Error, ${this.expression}>`,
    unannotatedExpression: () => ObjectType_createFunctionExpression.call(this),
    unqualifiedName: "create",
  });
}
