import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_fromJsonFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.fromJson")) {
    return Maybe.empty();
  }

  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  const chains: { expression: Code; variable: string }[] = [];

  this.parentObjectTypes.forEach((parentObjectType, parentObjectTypeI) => {
    chains.push({
      expression: code`${parentObjectType.name}.fromJson(${variables.jsonObject})`,
      variable: `super${parentObjectTypeI}`,
    });
  });

  const propertyInitializers = this.properties.flatMap((property) =>
    property.fromJsonInitializer({ variables }).toList(),
  );
  if (propertyInitializers.length > 0) {
    chains.push({
      expression: code`${this.reusables.snippets.sequenceRecord}({ ${joinCode(propertyInitializers, { on: "," })} })`,
      variable: "properties",
    });
  }

  let returnExpression: Code;
  switch (chains.length) {
    case 0:
      returnExpression = code`create({})`;
      break;
    case 1:
      returnExpression = code`(${chains[0].expression}).chain(create)`;
      break;
    default:
      returnExpression = code`${chains
        .reverse()
        .reduce(
          (acc, { expression, variable }) =>
            code`(${expression}).chain(${variable} => ${acc})`,
          code`(create({ ${chains.map((chain) => `...${chain.variable}`).join(", ")} }))`,
        )}`;
      break;
  }

  return Maybe.of(code`\
export function fromJson(${variables.jsonObject}: ${this.jsonType().name}): ${this.reusables.imports.Either}<Error, ${this.name}> {
  return ${returnExpression};
}`);
}
