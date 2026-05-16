import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_createFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("create")) {
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

  let initializers: Code[] = [];
  for (const parentObjectType of this.parentObjectTypes) {
    initializers.push(code`...${parentObjectType.name}.create(parameters)`);
  }
  const parametersHasQuestionToken =
    this.parentObjectTypes.length === 0 &&
    parametersPropertySignatures.every(
      (propertySignature) =>
        propertySignature.toCodeString([]).indexOf("?:") !== -1,
    );
  const parametersVariable = code`parameters${parametersHasQuestionToken ? "?" : ""}`;
  initializers = initializers.concat(
    this.properties.map((property) =>
      property.constructorInitializer({
        variables: { parameters: parametersVariable },
      }),
    ),
  );
  invariant(initializers.length > 0);

  const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
  return Maybe.of(code`\
export function create(parameters${parametersHasQuestionToken ? "?" : ""}: ${joinCode(parametersType, { on: " & " })}): ${this.name} {
  const ${syntheticNamePrefix}object = { ${joinCode(initializers, { on: "," })};
  if (!globalThis.Object.prototype.hasOwnProperty.call(${syntheticNamePrefix}object, "toString")) {
    (${syntheticNamePrefix}object as any).toString = ${syntheticNamePrefix}toString;
  }
  return ${syntheticNamePrefix}object;
}`);
}
