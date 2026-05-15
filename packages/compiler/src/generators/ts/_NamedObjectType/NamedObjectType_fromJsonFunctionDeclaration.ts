import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromJsonFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.features.has("json")) {
    return Maybe.empty();
  }

  const initializers: Code[] = [];
  const statements: Code[] = [];
  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  this.parentObjectTypes.forEach((parentObjectType) => {
    initializers.push(
      code`...${parentObjectType.name}.fromJson(${variables.jsonObject})`,
    );
  });

  for (const property of this.properties) {
    property
      .fromJsonExpression({
        variables,
      })
      .ifJust((propertyFromJsonExpression) => {
        initializers.push(
          code`${property.name}: ${propertyFromJsonExpression}`,
        );
      });
  }

  statements.push(
    code`return create({ ${joinCode(initializers, { on: ", " })} });`,
  );

  return Maybe.of(code`\
export function fromJson(${variables.jsonObject}: ${this.jsonType().name}): ${this.name} {
${joinCode(statements, { on: "\n" })}
}`);
}
