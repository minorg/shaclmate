import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_toJsonFunctionDeclaration(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.toJson")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export function toJson(${this.thisVariable}: ${this.expression}): ${this.jsonType().expression} {
  return JSON.parse(JSON.stringify({ ${joinCode(
    this.properties.flatMap((property) =>
      property
        .toJsonInitializer({
          variables: {
            value: property.accessExpression({
              variables: { object: this.thisVariable },
            }),
          },
        })
        .toList(),
    ),
    { on: "," },
  )} } satisfies ${this.jsonType().expression}));
}`);
}
