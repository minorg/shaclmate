import { Maybe } from "purify-ts";
import type { NamedObjectType } from "../NamedObjectType.js";
import { type Code, code, joinCode } from "../ts-poet-wrapper.js";

export function ObjectType_schemaVariableStatement(
  this: NamedObjectType,
): Maybe<Code> {
  if (!this.configuration.features.has("Object.schema")) {
    return Maybe.empty();
  }

  return Maybe.of(code`\
export const schema = { properties: { ${joinCode(
    this.parentObjectTypes
      .map(
        (parentObjectType) =>
          code`...${parentObjectType.name}.schema.properties`,
      )
      .concat(
        this.properties.flatMap((property) =>
          property.schema
            .toList()
            .map((propertySchema) => code`${property.name}: ${propertySchema}`),
        ),
      ),
    { on: ", " },
  )} } } as const;`);
}
