import { Maybe } from "purify-ts";
import type { ObjectType } from "../ObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_schemaVariableStatement(
  this: ObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.schema")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const schema = { properties: { ${joinCode(
    this.properties.flatMap((property) =>
      property.schema
        .toList()
        .map((propertySchema) => code`${property.name}: ${propertySchema}`),
    ),
    { on: ", " },
  )} } } as const;`);
}
