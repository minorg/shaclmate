import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function NamedObjectType_fromJsonFunctionDeclaration(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("json")) {
    return Maybe.empty();
  }

  let initializers: Code[] = [];
  const statements: Code[] = [];
  const variables = {
    jsonObject: code`${this.configuration.syntheticNamePrefix}json`,
  };

  this.parentObjectTypes.forEach((parentObjectType) => {
    initializers.push(
      code`...${parentObjectType.name}.fromJson(${variables.jsonObject})`,
    );
  });

  initializers = initializers.concat(
    this.properties.flatMap((property) =>
      property.fromJsonInitializer({ variables }).toList(),
    ),
  );

  statements.push(
    code`return create({ ${joinCode(initializers, { on: ", " })} }).unsafeCoerce();`,
  );

  return Maybe.of(code`\
export function fromJson(${variables.jsonObject}: ${this.jsonType().name}): ${this.name} {
${joinCode(statements, { on: "\n" })}
}`);
}
