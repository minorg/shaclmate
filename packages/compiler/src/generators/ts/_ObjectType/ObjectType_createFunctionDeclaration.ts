import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode, literalOf } from "../ts-poet-wrapper.js";

export function ObjectType_createFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.create")) {
    return Maybe.empty();
  }

  const parametersPropertySignatures = this.properties.flatMap((property) =>
    property.constructorParameter.toList(),
  );

  const parametersType: Code[] = [];
  if (parametersPropertySignatures.length > 0) {
    parametersType.push(code`{ ${joinCode(parametersPropertySignatures)} }`);
  }
  for (const parentObjectType of this.parentObjectTypes) {
    parametersType.push(
      code`Parameters<typeof ${parentObjectType.name}.create>[0]`,
    );
  }
  if (parametersType.length === 0) {
    parametersType.push(code`object`);
  }

  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) =>
        propertySignature.toCodeString([]).indexOf("?:") !== -1,
    );
  const parametersVariable = code`parameters${parametersHasQuestionToken ? "?" : ""}`;

  const parametersSignature = code`parameters${parametersHasQuestionToken ? "?" : ""}: ${joinCode(parametersType, { on: " & " })}`;

  const chains: { expression: Code; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.name}.create(parameters)`,
      variable: `super${parentObjectTypeI}`,
    });
  });

  const propertyInitializers = this.properties.flatMap((property) =>
    property
      .constructorInitializer({
        variables: { parameters: parametersVariable },
      })
      .toList(),
  );
  invariant(propertyInitializers.length > 0);
  chains.push({
    expression: code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} })`,
    variable: "properties",
  });

  let returnExpression = code`{ ${chains
    .map((chain) => `...${chain.variable}`)
    .join(
      ", ",
    )}, ${this._discriminantProperty.name}: ${literalOf(this.discriminantValue)} as const }`;

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
    returnExpression = code`${this.reusables.snippets.monkeyPatchObject}(${returnExpression}, { ${monkeyPatchMethods.join(", ")} })`;
  }

  returnExpression = chains
    .toReversed()
    .reduce(
      (acc, { expression, variable }, chainI) =>
        code`(${expression}).${chainI === 0 ? "map" : "chain"}(${variable} => ${acc})`,
      returnExpression,
    );

  return Maybe.of(code`\
export function create(${parametersSignature}): ${this.reusables.imports.Either}<Error, ${this.name}> {
  return ${returnExpression};
}
  
export function createUnsafe(${parametersSignature}): ${this.name} {
  return create(parameters).unsafeCoerce();
}`);
}
