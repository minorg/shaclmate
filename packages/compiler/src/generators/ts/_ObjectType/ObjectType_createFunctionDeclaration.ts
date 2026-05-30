import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.create")) {
    return Maybe.empty();
  }

  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParameter.toList(),
  );

  const parametersType =
    parametersPropertySignatures.length > 0
      ? code`{ ${joinCode(parametersPropertySignatures)} }`
      : code`object`;

  const parametersHasQuestionToken = parametersPropertySignatures.every(
    (propertySignature) =>
      propertySignature.toCodeString([]).indexOf("?:") !== -1,
  );
  const parametersVariable = code`parameters${parametersHasQuestionToken ? "?" : ""}`;

  const parametersSignature = code`parameters${parametersHasQuestionToken ? "?" : ""}: ${parametersType}`;

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

  return Maybe.of(code`\
export function create(${parametersSignature}): ${this.reusables.imports.Either}<Error, ${this.expression}> {
  return ${returnExpression};
}
  
export function createUnsafe(${parametersSignature}): ${this.expression} {
  return create(parameters).unsafeCoerce();
}`);
}
